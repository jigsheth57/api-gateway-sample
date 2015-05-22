package io.pivotal.example;

import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandKey;

/**
 * Sample {@link HystrixCommand} showing how implementing the
 * {@link #getCacheKey()} method enables request caching for eliminating
 * duplicate calls within the same request context.
 */
// public class CommandUsingRequestCache {
public class CustomHystrixCommand extends HystrixCommand<String> {
	
	public final String key;

	protected CustomHystrixCommand(String name, String groupKey) {
		super(Setter.withGroupKey(
				HystrixCommandGroupKey.Factory.asKey(groupKey)).andCommandKey(
				HystrixCommandKey.Factory.asKey(name)));
		this.key = name;
		
	}

	@Override
	protected String run() {
		return "";
	}

	@Override
	protected String getFallback() {
		return "";
	}
}