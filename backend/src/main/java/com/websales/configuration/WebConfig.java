package com.websales.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources from classpath:/static and classpath:/public
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "classpath:/public/")
                .setCachePeriod(3600);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward non-API, non-static routes to index.html for React Router
        // Important: Do NOT forward /api/** routes - they should be handled by Spring controllers
        // Only forward routes that don't match API or static resource patterns
        // Note: In development mode, frontend runs on port 3000 separately
        // This config is mainly for production when frontend is built into backend static resources
        
        // Only forward if it's not an API route and not a static resource
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
        
        // Set order so API routes are handled first (before view controllers)
        // This is important - we want /api/** to reach controllers, not get forwarded
    }
}


