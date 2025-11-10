package com.websales.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.websales.dto.request.CheckTokenRequest;
import com.websales.dto.request.EmployeeAuthRequest;
import com.websales.dto.response.AuthenticationResponse;
import com.websales.dto.response.CheckTokenResponse;
import com.websales.entity.Employee;
import com.websales.entity.InvalidToken;
import com.websales.entity.Permission;
import com.websales.entity.Role;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.InvalidTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Log4j2
public class EmployeeAuthenticationService {
    EmployeeRepo employeeRepo;
    PasswordEncoder passwordEncoder;
    InvalidTokenRepository  invalidTokenRepo;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected   String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected   Long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected  Long REFRESHABLE_DURATION;

    public AuthenticationResponse authenticate(EmployeeAuthRequest request) {
        var employee = employeeRepo.findEmployeeByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_EXIST) );

        if (!employee.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE);
        }

        boolean authenticated = passwordEncoder.matches(request.getPassword(), employee.getPasswordHash());
        if (!authenticated) {
         throw  new AppException(ErrorCode.PASSWORD_INVALID);
        }
        String token = generateToken(employee);


        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    public String generateToken(Employee employee) {
            JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS256);

            String jwtId = UUID.randomUUID().toString();
            JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                    .subject(employee.getFullName())
                    .issuer("sinh.com")
                    .issueTime(new Date())
                    .expirationTime(new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                    .jwtID(jwtId)
                    .claim("scop", buildScope(employee))
                    .build();

            Payload payload = new Payload(jwtClaimsSet.toJSONObject());

            JWSObject jwsObject = new JWSObject(jwsHeader, payload);

            try {
                jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
                String token = jwsObject.serialize();
                return token;
            } catch (JOSEException e) {
                log.error("Cannot creat token", e);
                throw new RuntimeException(e);
            }

    }

    private String buildScope(Employee employee) {
        StringJoiner scopeJoiner = new StringJoiner(" ");

        Set<Role> roles = employee.getEmployeeRoles();
        if (roles == null || roles.isEmpty()) {
            return "";
        }

        for (Role role : roles) {
            String roleName = role.getName()
                    .toUpperCase()
                    .replace(" ", "_");
            scopeJoiner.add("ROLE_" + roleName);

            Set<Permission> permissions = role.getRolePermissions();
            if (permissions != null && !permissions.isEmpty()) {
                for (Permission permission : permissions) {
                    String module = permission.getModule().toUpperCase();
                    String action = permission.getAction().toUpperCase();
                    String resource = permission.getResource().toUpperCase().replace(" ", "_");

                    String scopeItem = module + "_" + action + "_" + resource;
                    scopeJoiner.add(scopeItem);
                }
            }
        }

        return scopeJoiner.toString();
    }


    private SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {

        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date  expiryTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var  verify = signedJWT.verify(verifier);
        if(!(verify && expiryTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if(invalidTokenRepo
                .existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        return signedJWT;
    }


    public void logout(CheckTokenRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidToken invalidToken = InvalidToken.builder()
                    .id(jit)
                    .expiryTime(expiryTime)
                    .build();

            invalidTokenRepo.save(invalidToken);

        } catch (AppException e) {
            log.info("Token already expired");
        }


    }


    public CheckTokenResponse checkTokenValid(CheckTokenRequest request) throws JOSEException, ParseException {
        var  token = request.getToken();

        boolean isValid = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }
        return CheckTokenResponse.builder()
                .valid(isValid)
                .build();


    }

    public AuthenticationResponse refreshToken(CheckTokenRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidToken invalidToken = InvalidToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidTokenRepo.save(invalidToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();
        var employee = employeeRepo.findByFullName(username).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));
        if (!employee.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE);
        }
        var token = generateToken(employee);
        return   AuthenticationResponse.builder()
                .token(token)
                .build();
    }

}
