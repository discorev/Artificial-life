/**
 * Fish Swarm App
 * 
 * @author Oliver Hayman
 * @date 10th April 2015
 * @version 1.5
 */

(function(){
	var app = angular.module("fishSwarm", ['ui.bootstrap']);

	app.directive("fishTank", function(){
		return {
			retrict: 'E',
			templateUrl: 'fish-tank.html'
		}; 
	});
	
	app.directive("controlBox", function(){
		return {
			link:function(scope,element, attrs) {
				element.css('display','block');
			}
		};
	});

	// Find the <div fish> and make a two way binding to it's object in the controller.
	// Watch for the position and angle parameters of the fish changing.
	app.directive("fish", function() {
		return {
			restrict: 'A',
			scope: {
				owner: '='
			},
			template: '<img width="40px" height="40px" src="img/fish.svg" style="-webkit transform:scale(-1,1)" />',
			link:function(scope, element, attrs) {
				element.css('position', 'absolute'); // it's position will be absolutely defined.
				scope.$watch('owner.angle', function() {
					element.css('transform', 'rotate('+scope.owner.angle+'deg)');
					element.css('-webkit-transform', 'rotate('+scope.owner.angle+'deg)');
					element.css('-ms-transform', 'rotate('+scope.owner.angle+'deg)');
					element.css('-moz-transform', 'rotate('+scope.owner.angle+'deg)');
					element.css('-o-transform', 'rotate('+scope.owner.angle+'deg)');
				});
				scope.$watch('owner.position.y', function() {
					element.css('top', scope.owner.position.y-20+'px');
				});
				scope.$watch('owner.position.x', function() {
					element.css('left', scope.owner.position.x-40+'px');
				});
			}
		};
	});

	app.directive("shark", function() {
		return {
			restrict: 'A',
			scope: {
				owner: '='
			},
			template: '<img width="100px" height="40px" src="img/shark.svg" />',
			link:function(scope, element, attrs) {
				element.css('position', 'absolute'); // it's position will be absolutely defined.
				scope.$watch('owner.angle', function() {
					var angle = scope.owner.angle;
					if(scope.owner.angle > 90 && scope.owner.angle < 270)
					{
						angle -= 180;
						element.children().attr("src","img/leftShark.svg");
					} else if(-270 < angle && angle < -90) {
						angle += 180;
						element.children().attr("src","img/leftShark.svg");
					} else {
						element.children().attr("src","img/shark.svg");
					}
					element.css('transform', 'rotate('+angle+'deg)');
					element.css('-webkit-transform', 'rotate('+angle+'deg)');
					element.css('-ms-transform', 'rotate('+angle+'deg)');
					element.css('-moz-transform', 'rotate('+angle+'deg)');
					element.css('-o-transform', 'rotate('+angle+'deg)');
				});
				scope.$watch('owner.position.y', function() {
					element.css('top', scope.owner.position.y-22.5+'px');
				});
				scope.$watch('owner.position.x', function() {
					element.css('left', scope.owner.position.x-75+'px');
				});
			}
		};
	});

	app.directive("foodBall", function(){
		return {
			restrict: 'E',
			link:function(scope, element, attrs) {
				element.addClass('circle');
				element.css('position', 'absolute');
				scope.$watch(attrs.x, function (x) {
					element.css('left', x + 'px');
				});
				scope.$watch(attrs.y, function (y) {
					element.css('top', y + 'px');
				});
			}
		};
	});
	
	// replace the instructions element with the instructions (keep the HTML looking nice)
	app.directive("instructions", function(){
		return {
			retrict: 'E',
			templateUrl: 'instructions.html'
		}; 
	});

	// replace the parameters element with the parameters stuff (keep the HTML looking nice)
	app.directive("parameters", function(){
		return {
			retrict: 'E',
			templateUrl: 'parameters.html'
		}; 
	});

	// based on: http://www.bennadel.com/blog/2422-capturing-document-click-events-with-angularjs.htm
	app.directive("bnDocumentClick",["$document", "$parse", function($document, $parse){
		return {
			link:function(scope, element, attrs) {
				// Get the expression we want to evaluate on the scope when the document is clicked.
				var scopeExpression = attrs.bnDocumentClick;

				// Compile the scope expression so that we can
				// explicitly invoke it with a map of local
				// variables. We need this to pass-through the
				// click event.
				var invoker = $parse( scopeExpression );

				// Bind to the document click event.
				$document.on(
						"click",
						function(event){
							scope.$apply(function() {
								invoker(
										scope,
										{
											$event: event
										});
							});
						});
			}
		};
	}]);

	app.controller("TankController",["$scope", "$timeout", function($scope, $timeout) {
		// create a container to hold the fish
		this.fish = [];
		$scope.food = [];
		$scope.epoch = 0;
		this.sharks = [];//{
//			angle: 0,
//			position: new THREE.Vector2(Math.random()*800,Math.random()*800),
//			velocity: new THREE.Vector2()
//		},{
//			angle: 0,
//			position: new THREE.Vector2(Math.random()*800,Math.random()*800),
//			velocity: new THREE.Vector2()
//		}];

		// generate a random set of fish
		for(i=0; i < 60; i++)
		{
			// initalize the new fish in an random position
			var newFish = {
					angle: 0,
					position: new THREE.Vector2(Math.random()*800,Math.random()*800),
					velocity: new THREE.Vector2(),
					best: null
			};
			this.fish.push(newFish);
		}

		// these are the parameters that are adjustable
		$scope.parameters = {
				separation: 100,
				alignment: 100,
				cohesion: 100,
				speedLimit: 100
		};
		$scope.parameterHelp = {
				separation: "Separation causes the fish to avoid getting too close to each other.",
				alignment: "Alignment causes the fish to swim in the same direction as each other.",
				cohesion: "Cohesion causes the fish to swim together.",
				speedLimit: "Speed sets the maximum speed the fish can swim."
		};
		
		this.addShark = function()
		{
			var shark = {
				angle: 0,
				position: new THREE.Vector2(Math.random()*800, Math.random()*800),
				velocity: new THREE.Vector2()
			};
			this.sharks.push(shark);
			$scope.parameters.separation = 10;
		}

		// When the document is clicked, it will invoke
		// this method, passing-through the jQuery event.
		$scope.handleClick = function( event ){
			// get the start of the tank
			var push = document.querySelector("#tankContainer").getBoundingClientRect().left;
			if(event.clientX-push < 750)
			{
				$scope.food.push({x: event.clientX-push, y: event.clientY-30});
			}
		};

		$scope.limitSpeed = function(fish)
		{
			var limitParam = this.parameters['speedLimit']/100;
			if(fish.velocity.lengthSq() > limitParam*20)
			{
				fish.velocity.normalize()
				fish.velocity.multiplyScalar(limitParam*20);
			}
		};

		// bind the fish and parameters to the algorithm
		fishAnimator(this.fish, this.sharks, $scope, $timeout);
		sharkAnimator(this.sharks, $scope, this.fish, $timeout)
	}]);

	app.filter('capitalize', function() {
		return function(input) {
			if (input!=null)
				input = input.toLowerCase();
			return input.substring(0,1).toUpperCase()+input.substring(1);
		}
	});

	// non-primative boid behaviour
	function attractToFlake(fish, flake)
	{
		var output = new THREE.Vector2(flake.x+5, flake.y+5);
		var distance = fish.position.distanceTo(output.clone());
		distance /= 2;

		output.sub(fish.position);
		// the "sent" attracts fish to food, but this
		// decays over distance
		return output.divideScalar(distance);
	}
	
	function fear(sharks, fish)
	{
		// for each shark, repell
		var output = new THREE.Vector2();
		for(i=0; i < sharks.length; i++)
		{
			var dist = fish.position.distanceTo(sharks[i].position.clone());
			dist /= 2;
			var tmp = fish.position.clone();
			tmp.sub(sharks[i].position);
			tmp.divideScalar(dist);
			output.add(tmp);
		}
		return output; // if there are no sharks then this wont affect the velocity 
	}

	function fishAnimator(school, sharks, $scope, $timeout) {
		(function tick() {
			var i;
			var max = new THREE.Vector2(740,720);
			var min = new THREE.Vector2();
			var params = $scope.parameters;

			for (i = 0; i < school.length; i++) {
				var fish = school[i];

				var moveAppart = separation(school, i);
				if(moveAppart.length() > 0 && params.separation != 0)
				{
					moveAppart.multiplyScalar((params.separation/100));
					fish.velocity.add(moveAppart);
				} else {
					fish.velocity.add(cohesion(school, i).multiplyScalar((params.cohesion/100)));
					fish.velocity.add(alignment(school, i).multiplyScalar((params.alignment/100)));
				}

				// fish have a tendancy to re-visit places they were fed.
				if(fish.best != null && $scope.food.length == 0)
				{
					var bestInfluence = fish.best.clone();
					bestInfluence.sub(fish.position);
					bestInfluence.multiplyScalar(0.1);
					bestInfluence.multiplyScalar(Math.random());
					fish.velocity.add(bestInfluence);
				}

				// attract to food if needed
				for(a=0; a < $scope.food.length; a++)
				{
					fish.velocity.add(attractToFlake(fish, $scope.food[a]));
				}
				
				// fish are scared of sharks...
				if(sharks.length > 0)
					fish.velocity.add(fear(sharks, fish));

				//limitSpeed(fish, (params.speedLimit/100)); // to make this realistic, limit the speed
				$scope.limitSpeed(fish);

				// check if the position of the fish is within the bounds
				if(fish.position.x < min.x)
				{
					fish.velocity.x += 10;
				} else if(fish.position.x > max.x)
				{
					fish.velocity.x -= 10;
				}
				if(fish.position.y < min.y)
				{
					fish.velocity.y += 10;
				} else if(fish.position.y > max.y)
				{
					fish.velocity.y -= 10;
				}

				// rotate the fish to face the direction it's moving in
				fish.angle = Math.atan2(fish.velocity.y, fish.velocity.x) * (180/Math.PI);
				fish.position.add(fish.velocity); // update hte position of the fish
				for(a=0; a<$scope.food.length; a++)
				{
					// adjust the food to be the center of the food (it's 10px by 10px)
					var foodPos = new THREE.Vector2($scope.food[a].x+2.5, $scope.food[a].y+2.5);
					if(fish.position.distanceTo(foodPos) <= 5)
					{
						fish.best = foodPos.clone();
						$scope.food.splice(a, 1);
					}
				}
			}
			
			$scope.epoch++;
			
			// every 100 epochs the fish have 10 babys
			if(($scope.epoch % 100) == 0 && school.length < 80)
			{
				for(i=0; i < 10; i++)
				{
					// initalize the new fish in an random position
					var newFish = {
							angle: 0,
							position: new THREE.Vector2(Math.random()*800, Math.random()*800),
							velocity: new THREE.Vector2(),
							best: null
					};
					school.push(newFish);
				}
			}
			$timeout(tick, 60);
		})();
	}

	function sharkAnimator(sharks, $scope, school, $timeout) {
		(function tick() {
			var max = new THREE.Vector2(700,700);
			var min = new THREE.Vector2(20, 20);

			for (var i = 0; i < sharks.length; i++) {
				var shark = sharks[i];

				if(school.length > 0)
				{
					var fishScent = new THREE.Vector2();
					for(i=0; i < school.length; i++)
					{
						fishScent.add(school[i].position);
					}
					fishScent.divideScalar(school.length);
					fishScent.sub(shark.position);
					fishScent.divideScalar(10);
					var findingAbility = Math.random();
					fishScent.multiplyScalar(findingAbility);
					shark.velocity.add(fishScent);
				}

				// limit the shark's speed
				var limitParam = $scope.parameters['speedLimit']/100;
				if(shark.velocity.lengthSq() > limitParam*25)
				{
					shark.velocity.normalize()
					shark.velocity.multiplyScalar(limitParam*25);
				}

				// check if the position of the fish is within the bounds
				if(shark.position.x < min.x)
				{
					shark.velocity.x += 10;
				} else if(shark.position.x > max.x)
				{
					shark.velocity.x -= 10;
				}
				if(shark.position.y < min.y)
				{
					shark.velocity.y += 10;
				} else if(shark.position.y > max.y)
				{
					shark.velocity.y -= 10;
				}

				// rotate the fish to face the direction it's moving in
				shark.angle = Math.atan2(shark.velocity.y, shark.velocity.x) * (180/Math.PI);
				shark.position.add(shark.velocity); // update hte position of the fish

				// now see if the shark has eaten a fish
				for(a=0; a<school.length; a++)
				{
					if(shark.position.distanceTo(school[a].position) <= 10)
					{
						shark.best = school[a].position.clone();
						school.splice(a, 1);
					}
				}
			}
			$timeout(tick, 60);
		})();
	}
})();
