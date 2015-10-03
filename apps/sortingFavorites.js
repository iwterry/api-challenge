	/* The FavIds object is meant to keep track of the ids of the user's favorite recommendations 
	and will provide the functions that will allow the user to be able to sort his/her recommendations
	in a variety of ways. */ 
	function FavIds() {
		var ids = [];
		this.setAsFav = function(id) {
			if(typeof(id) === "string") {
				ids.push(id);
			}
			else {
				console.log("The argument provided to the method 'setAsFav' must be a string.");
			}
		};
		this.deleteFav = function(id) {
			var index = ids.indexOf(id);
			if(index > -1) {
				ids.splice(index, 1);
			}
			else {
				console.log("The element to be deleted in not in the array.");
			}
		};
		this.getAscOrderId = function() {
			return ids.slice(0).sort();
		};
		this.getDescOrderId = function() {
			return ids.slice(0).sort(function(a, b) {
				if(b > a) {
					return 1;
				}
				else if(b < a){
					return -1;
				}
				return 0; 
			});
		};
		this.getAscOrderAdded = function() {
			return ids.slice(0).reverse();
		};
		this.getDescOrderAdded = function() {
			return ids.slice(0);
		}
		this.sort = function(typeOfSort) {
			if(typeof(typeOfSort) !== "string") {
				console.log("The argument given to method 'sort' must be a string.")
				return;
			}
			
			switch(typeOfSort) {
				case "name-ascending":
					return this.getAscOrderId(); 
				case "name-descending":
					return this.getDescOrderId();
				case "added-ascending":
					return this.getAscOrderAdded();
				case "added-descending":
					return this.getDescOrderAdded();
				default:
					console.log("The string argument method 'sort' must be valid name for a sort type.");
					return; 
			}
		}
	};