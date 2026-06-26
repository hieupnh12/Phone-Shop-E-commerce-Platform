package com.websales.service;

import com.websales.dto.request.CreateSupportConversationRequest;
import com.websales.dto.request.SendSupportMessageRequest;
import com.websales.dto.request.UpdateSupportConversationRequest;
import com.websales.dto.response.SupportConversationResponse;
import com.websales.dto.response.SupportMessageResponse;
import com.websales.entity.Customer;
import com.websales.entity.Employee;
import com.websales.entity.SupportConversation;
import com.websales.entity.SupportMessage;
import com.websales.enums.MessageSenderType;
import com.websales.enums.SupportConversationStatus;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.CustomerRepo;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.SupportConversationRepository;
import com.websales.repository.SupportMessageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupportConversationService {

    SupportConversationRepository conversationRepository;
    SupportMessageRepository messageRepository;
    CustomerRepo customerRepo;
    EmployeeRepo employeeRepo;

    @Transactional
    public SupportConversationResponse createConversation(CreateSupportConversationRequest request, Long customerId) {
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        SupportConversation conversation = SupportConversation.builder()
                .customer(customer)
                .subject(request.getSubject().trim())
                .status(SupportConversationStatus.OPEN)
                .lastMessage(request.getContent().trim())
                .lastMessageAt(LocalDateTime.now())
                .build();

        SupportConversation saved = conversationRepository.save(conversation);
        saveMessage(saved, MessageSenderType.CUSTOMER, customerId, request.getContent().trim());
        return toResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public List<SupportConversationResponse> getConversationsByCustomer(Long customerId) {
        return conversationRepository.findByCustomer_CustomerIdOrderByUpdatedAtDesc(customerId).stream()
                .map(c -> toResponse(c, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<SupportConversationResponse> getAllConversations(Pageable pageable) {
        return conversationRepository.findAll(pageable).map(c -> toResponse(c, false));
    }

    @Transactional(readOnly = true)
    public Page<SupportConversationResponse> getConversationsForEmployee(Long employeeId, Pageable pageable) {
        return conversationRepository.findAssignedOrOpen(employeeId, pageable).map(c -> toResponse(c, false));
    }

    @Transactional(readOnly = true)
    public SupportConversationResponse getConversationDetail(Integer conversationId, boolean includeMessages) {
        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại"));
        return toResponse(conversation, includeMessages);
    }

    @Transactional
    public SupportMessageResponse sendMessage(
            Integer conversationId,
            SendSupportMessageRequest request,
            MessageSenderType senderType,
            Long senderId) {

        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại"));

        if (senderType == MessageSenderType.CUSTOMER) {
            if (!conversation.getCustomer().getCustomerId().equals(senderId)) {
                throw new RuntimeException("Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này");
            }
        } else if (conversation.getEmployee() == null
                || !conversation.getEmployee().getId().equals(senderId)) {
            throw new AppException(ErrorCode.MESSAGE_CONVERSATION_ALREADY_CLAIMED);
        }

        if (conversation.getStatus() == SupportConversationStatus.CLOSED) {
            throw new RuntimeException("Cuộc hội thoại đã đóng");
        }

        SupportMessage saved = saveMessage(conversation, senderType, senderId, request.getContent().trim());
        conversation.setLastMessage(request.getContent().trim());
        conversation.setLastMessageAt(LocalDateTime.now());
        if (senderType == MessageSenderType.EMPLOYEE
                && conversation.getStatus() == SupportConversationStatus.ASSIGNED) {
            conversation.setStatus(SupportConversationStatus.RESOLVED);
        }
        conversationRepository.save(conversation);
        return toMessageResponse(saved);
    }

    @Transactional
    public SupportConversationResponse claimConversation(Integer conversationId, Long employeeId) {
        SupportConversation conversation = conversationRepository.findByIdForUpdate(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại"));

        if (conversation.getStatus() != SupportConversationStatus.OPEN) {
            throw new AppException(ErrorCode.MESSAGE_CONVERSATION_NOT_OPEN);
        }
        if (conversation.getEmployee() != null) {
            if (conversation.getEmployee().getId().equals(employeeId)) {
                return toResponse(conversation, false);
            }
            throw new AppException(ErrorCode.MESSAGE_CONVERSATION_ALREADY_CLAIMED);
        }

        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        conversation.setEmployee(employee);
        conversation.setStatus(SupportConversationStatus.ASSIGNED);
        return toResponse(conversationRepository.save(conversation), false);
    }

    @Transactional
    public SupportConversationResponse updateConversation(
            Integer conversationId,
            UpdateSupportConversationRequest request,
            Long actingEmployeeId,
            boolean canViewAll) {

        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại"));

        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepo.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
            if (conversation.getEmployee() != null
                    && !conversation.getEmployee().getId().equals(request.getEmployeeId())) {
                throw new AppException(ErrorCode.MESSAGE_CONVERSATION_ALREADY_CLAIMED);
            }
            conversation.setEmployee(employee);
            conversation.setStatus(SupportConversationStatus.ASSIGNED);
        }

        if (request.getStatus() != null) {
            if (request.getStatus() == SupportConversationStatus.CLOSED) {
                conversation.setStatus(SupportConversationStatus.CLOSED);
            } else if (canViewAll) {
                conversation.setStatus(request.getStatus());
            }
        }

        return toResponse(conversationRepository.save(conversation), false);
    }

    @Transactional
    public void markMessagesAsRead(Integer conversationId, MessageSenderType readerType) {
        MessageSenderType targetSender = readerType == MessageSenderType.CUSTOMER
                ? MessageSenderType.EMPLOYEE
                : MessageSenderType.CUSTOMER;

        messageRepository.findByConversation_ConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .filter(m -> m.getSenderType() == targetSender && m.getReadAt() == null)
                .forEach(m -> {
                    m.setReadAt(LocalDateTime.now());
                    messageRepository.save(m);
                });
    }

    private SupportMessage saveMessage(
            SupportConversation conversation,
            MessageSenderType senderType,
            Long senderId,
            String content) {

        SupportMessage message = SupportMessage.builder()
                .conversation(conversation)
                .senderType(senderType)
                .senderId(senderId)
                .content(content)
                .build();
        return messageRepository.save(message);
    }

    private SupportConversationResponse toResponse(SupportConversation conversation, boolean includeMessages) {
        long unreadForStaff = messageRepository.countByConversation_ConversationIdAndReadAtIsNullAndSenderType(
                conversation.getConversationId(), MessageSenderType.CUSTOMER);
        long unreadForCustomer = messageRepository.countByConversation_ConversationIdAndReadAtIsNullAndSenderType(
                conversation.getConversationId(), MessageSenderType.EMPLOYEE);

        SupportConversationResponse.SupportConversationResponseBuilder builder = SupportConversationResponse.builder()
                .conversationId(conversation.getConversationId())
                .customerId(conversation.getCustomer().getCustomerId())
                .customerName(conversation.getCustomer().getFullName())
                .customerEmail(conversation.getCustomer().getEmail())
                .customerPhone(conversation.getCustomer().getPhoneNumber())
                .subject(conversation.getSubject())
                .status(conversation.getStatus())
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadForStaff)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt());

        if (conversation.getEmployee() != null) {
            builder.employeeId(conversation.getEmployee().getId())
                    .employeeName(conversation.getEmployee().getFullName());
        }

        if (includeMessages) {
            builder.messages(messageRepository
                    .findByConversation_ConversationIdOrderByCreatedAtAsc(conversation.getConversationId())
                    .stream()
                    .map(this::toMessageResponse)
                    .collect(Collectors.toList()));
            builder.unreadCount(unreadForCustomer);
        }

        return builder.build();
    }

    private SupportMessageResponse toMessageResponse(SupportMessage message) {
        String senderName = resolveSenderName(message.getSenderType(), message.getSenderId());
        return SupportMessageResponse.builder()
                .messageId(message.getMessageId())
                .conversationId(message.getConversation().getConversationId())
                .senderType(message.getSenderType())
                .senderId(message.getSenderId())
                .senderName(senderName)
                .content(message.getContent())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private String resolveSenderName(MessageSenderType senderType, Long senderId) {
        if (senderType == MessageSenderType.CUSTOMER) {
            return customerRepo.findById(senderId).map(Customer::getFullName).orElse("Khách hàng");
        }
        return employeeRepo.findById(senderId).map(Employee::getFullName).orElse("Nhân viên");
    }
}
