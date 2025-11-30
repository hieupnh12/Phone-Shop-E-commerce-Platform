package com.websales.configuration;

import com.websales.constant.PermissionKeys;
import com.websales.entity.Employee;
import com.websales.entity.Permission;
import com.websales.entity.Role;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.PermissionRepo;
import com.websales.repository.RoleRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final PermissionRepo permissionRepository;
    private final RoleRepo roleRepository;
    private final EmployeeRepo employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Bắt đầu khởi tạo dữ liệu mặc định (Seeding)...");

        Set<Permission> allPermissions = seedPermissions();
        log.info("Đã tạo hoặc đảm bảo {} Permissions tồn tại.", allPermissions.size());

        Role adminRole = seedRoleAdmin(allPermissions);
        log.info("Đã tạo hoặc đảm bảo Role ADMIN tồn tại với {} quyền.", adminRole.getRolePermissions().size());

        seedDefaultAdminUser(adminRole);
        log.info("Đã đảm bảo tài khoản Admin mặc định tồn tại.");
    }


    private Set<Permission> seedPermissions() {
        Set<Permission> createdPermissions = new HashSet<>();

        for (String permKey : PermissionKeys.ALL_PERMISSIONS) {
            // Parse format mới: PRODUCT_VIEW_ALL -> module: PRODUCT, action: VIEW, resource: ALL
            // Format: MODULE_ACTION_RESOURCE (với underscore)
            String[] parts = permKey.split("_");

            // Cần ít nhất 3 phần: MODULE_ACTION_RESOURCE
            // Ví dụ: PRODUCT_VIEW_ALL -> [PRODUCT, VIEW, ALL]
            //        STAFF_MANAGE_ROLES -> [STAFF, MANAGE, ROLES]
            if (parts.length < 3) {
                log.warn("Permission key không đúng format (cần ít nhất 3 phần): {}", permKey);
                continue;
            }

            // Phần đầu là MODULE
            String module = parts[0];
            // Phần thứ 2 là ACTION
            String action = parts[1];
            // Phần còn lại (từ phần 3 trở đi) là RESOURCE, nối lại bằng underscore
            String resource = String.join("_", Arrays.copyOfRange(parts, 2, parts.length));

            Permission existingPerm = permissionRepository
                    .findByModuleAndActionAndResource(module, action, resource)
                    .orElseGet(() -> {
                        Permission newPerm = Permission.builder()
                                .module(module)
                                .action(action)
                                .resource(resource)
                                .build();
                        return permissionRepository.save(newPerm);
                    });

            createdPermissions.add(existingPerm);
        }
        return createdPermissions;
    }


    private Role seedRoleAdmin(Set<Permission> allPermissions) {
        final String ADMIN_ROLE_NAME = "ADMIN";

        Role adminRole = roleRepository.findByName(ADMIN_ROLE_NAME)
                .orElseGet(() -> {
                    return roleRepository.save(Role.builder()
                            .name(ADMIN_ROLE_NAME)
                            .description("Quản trị viên toàn hệ thống...")
                            .build());
                });

        adminRole.setRolePermissions(allPermissions);
        return roleRepository.save(adminRole);
    }


    private void seedDefaultAdminUser(Role adminRole) {
        final String DEFAULT_ADMIN_EMAIL = "sinhnnde180169@fpt.edu.vn";

        if (employeeRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isEmpty()) {
            Employee admin = Employee.builder()
                    .email(DEFAULT_ADMIN_EMAIL)
                    .fullName("Quản trị viên Hệ thống")
                    .passwordHash(passwordEncoder.encode("999999999"))
                    .isActive(true)
                    .employeeRoles(Set.of(adminRole))
                    .build();
            employeeRepository.save(admin);
        }
    }
}