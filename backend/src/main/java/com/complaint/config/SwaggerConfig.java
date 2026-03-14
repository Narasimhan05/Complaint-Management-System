package com.complaint.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures Swagger UI with JWT support.
 * Visit: http://localhost:8080/swagger-ui.html
 *
 * Click "Authorize" → paste your JWT token → all endpoints are unlocked.
 * Show this in interviews — it demonstrates API documentation skills.
 */
@Configuration
@SecurityScheme(
    name        = "bearerAuth",
    type        = SecuritySchemeType.HTTP,
    scheme      = "bearer",
    bearerFormat = "JWT",
    in          = SecuritySchemeIn.HEADER,
    paramName   = "Authorization",
    description = "Paste your JWT token here (without 'Bearer ' prefix)"
)
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Complaint Management System API")
                .description(
                    "Enterprise complaint tracking with SLA enforcement, " +
                    "JWT authentication, role-based access, and notifications.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Your Name")
                    .email("your@email.com")));
    }
}
