/**
 * Swarm Intelligence Site
 * 
 * @author	Oliver Hayman
 * @date	16th April 2015
 * @version	1.0
 */

(function(){
	var app = angular.module("swarmSite", []);
	
	app.directive("navigation", function(){
		return {
			restrict: 'E',
			templateUrl: 'navigation-menu.html'
		};
	});
	
	app.directive("launchButton", function(){
		return {
			restrict: 'E',
			template: '<p><a class="btn btn-primary btn-lg pull-right" href="demo.html" target="_blank" role="button">Launch demo &raquo;</a></p>'
		};
	});
	
	app.directive("swarmIntelligence", function(){
		return {
			restrict: 'E',
			templateUrl: 'swarm-intelligence.html'
		}; 
	});
	
	app.directive("artificialLife", function(){
		return {
			restrict: 'E',
			templateUrl: 'artificial-life.html'
		}; 
	});
	
	app.directive("particleSwarm", function(){
		return {
			restrict: 'E',
			templateUrl: 'particle-swarm.html'
		}; 
	});
	
	app.directive("aboutDemo", function(){
		return {
			restrict: 'E',
			templateUrl: 'about-demo.html',
			link: function(scope,element,attr) {
				MathJax.Hub.Queue(["Typeset", MathJax.Hub, element[0]]);
			}
		}; 
	});
})();