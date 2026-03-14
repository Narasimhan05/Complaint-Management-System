package com.complaint.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Wraps ALL API responses in a consistent structure.
 *
 * Every endpoint returns:
 * {
 *   "success": true/false,
 *   "message": "human readable message",
 *   "data": { ...actual payload... }
 * }
 *
 * Interview: This is the "Response Envelope" pattern —
 * makes frontend error handling simple and consistent.
 */
@Data
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
