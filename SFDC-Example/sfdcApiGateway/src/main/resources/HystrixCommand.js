module.exports = (function() {
	'use strict';
	
	var hystrixCommandClass = Java.type('io.pivotal.example.CustomHystrixCommand');
	
	function HystrixCommand(name, group, runMethod, fallbackMethod) {
		
		var JavaClass = Java.extend(hystrixCommandClass, {
			run: runMethod,
			getFallback: fallbackMethod
		});
		
		this.command = new JavaClass(name, group);
	}
	
	HystrixCommand.prototype.execute = function() {
		return this.command.execute();
	};
	
	return HystrixCommand;
}());