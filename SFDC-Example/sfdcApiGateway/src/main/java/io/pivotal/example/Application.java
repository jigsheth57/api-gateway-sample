package io.pivotal.example;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;

@Configuration
@EnableAutoConfiguration
@ComponentScan
@EnableConfigurationProperties
public class Application extends com.pivotal.mss.apigateway.Application {
	
	public static void main(String[] args) {
		runApplication(Application.class, args);
	}

	@Bean
	public ServletRegistrationBean hystrixMetricsStreamServletRegistration(HystrixMetricsStreamServlet hystrixMetricsStreamServlet) {
		ServletRegistrationBean registration = new ServletRegistrationBean(hystrixMetricsStreamServlet);
		registration.addUrlMappings("/hystrix.stream");
		return registration;
	}
	@Bean
	public HystrixMetricsStreamServlet hystrixMetricsStreamServlet() {
		return new HystrixMetricsStreamServlet();
	}
}
