package com.vouldvell.springjwtauth.controller;

import com.vouldvell.springjwtauth.entity.AuthRequest;
import com.vouldvell.springjwtauth.entity.RefreshTokenRequest;
import com.vouldvell.springjwtauth.entity.UserInfo;
import com.vouldvell.springjwtauth.service.JwtService;
import com.vouldvell.springjwtauth.service.UserInfoDetails;
import com.vouldvell.springjwtauth.service.UserInfoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserInfoService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public UserController(UserInfoService userService, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/")
    public String index() {
        return "index"; // Имя файла без расширения (index.html)
    }

    @PostMapping("/addNewUser")
    public String addNewUser(@RequestBody UserInfo userInfo) {
        return userService.addUser(userInfo);
    }

    @GetMapping("/user/userProfile")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<UserInfo> userProfile(Authentication authentication) {
        // Получаем UserDetails из Security Context
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Преобразуем в UserInfoDetails и извлекаем UserInfo
        UserInfo user = ((UserInfoDetails) userDetails).getUserInfo();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/admin/adminProfile")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public String adminProfile() {
        return "Welcome to Admin Profile";
    }

    @Deprecated
    @PostMapping("/generateToken")
    public ResponseEntity<Map<String, String>> authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );
        if (authentication.isAuthenticated()) {
            return ResponseEntity.ok(jwtService.generateTokens(authRequest.getUsername()));
        } else {
            throw new UsernameNotFoundException("Invalid user request!");
        }
    }

    @Deprecated
    @PostMapping("/refreshToken")
    public ResponseEntity<String> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        String newAccessToken = jwtService.refreshToken(refreshTokenRequest.getRefreshToken());
        if (newAccessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
        return ResponseEntity.ok(newAccessToken);
    }
}
