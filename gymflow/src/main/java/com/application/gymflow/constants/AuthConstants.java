package com.application.gymflow.constants;

public final class AuthConstants {

    private AuthConstants() {}

    public static final String STATUS_200 = "200";
    public static final String MESSAGE_200_LOGIN = "Login successful";

    public static final String STATUS_201 = "201";
    public static final String MESSAGE_201_REGISTER = "User registered successfully";

    public static final String STATUS_400 = "400";
    public static final String MESSAGE_400_EMAIL = "Email already in use";
    public static final String MESSAGE_400_PHONE = "Phone already in use";

    public static final String STATUS_403 = "403";
    public static final String MESSAGE_403_INACTIVE = "Account is not active";

    public static final String STATUS_401 = "401";
    public static final String MESSAGE_401_INVALID = "Invalid credentials";

    public static final String STATUS_500 = "500";
    public static final String MESSAGE_500 = "Internal Server Error";
}
