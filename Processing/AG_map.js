console.log("Start");
let xmax;
let ymax;
let scale = 1;
let ShadeOffset = 1;
let ActiveElements = [];
let Buttons = [];
let playActive = false;
let drawLines = true;
let firstFrameOfClick = true;
let misclick = "unknown";
let Click_timeStart = 0;
let dragThreshold = 300; //in milliseconds
let dragActive = false;
let selectedByMouse = "type";
let selectedNumber = -1;
let txtSize = 20;
let initialtxtSize = txtSize;
let distThresholdScaled = 10000;
let temperature = 0;
let heatExperimentActive = false;
let connection_discreditor = 4;


//active element object
class ActiveElement{
	constructor(
  theType, theName,
  theRedHue, theGreenHue, theBlueHue,
  theRedHueSelected, theGreenHueSelected, theBlueHueSelected,
  theXpos, theYpos, theRadius,
  theDisplayedText, thePartners
  ) {    
    //constructor
    this.type = theType;
    this.name = theName;
    this.normalRedHue = theRedHue;
    this.redH = theRedHue;
    this.normalGreenHue = theGreenHue;
    this.greenH = theGreenHue;
    this.normalBlueHue = theBlueHue;
    this.blueH = theBlueHue;
    this.redHueSelected = theRedHueSelected;
    this.greenHueSelected = theGreenHueSelected;
    this.blueHueSelected = theBlueHueSelected;
    this.xPos = 1975 * scale * theXpos;
    this.yPos = 1075 * scale * theYpos;
    this.radius = theRadius;
    this.displayedText = theDisplayedText;
    this.partners = thePartners;
	this.connections = [];
	this.numberOfConnections = 0;
  }
    
    //class functions    
    display() {
      //ellipse part
      fill(this.redH,this.greenH,this.blueH);
      stroke(0);
	  strokeWeight(1);
      ellipse(this.xPos, this.yPos, this.radius*scale*1.3, this.radius*scale*1.3);
      
      //text handling, add text offset for small circles
      stroke(255);
      textSize(txtSize);
      fill(255);
      textAlign(CENTER);
      text(this.displayedText, this.xPos + ShadeOffset, this.yPos + ShadeOffset);
      fill(0);
      stroke(255);
      text(this.displayedText, this.xPos, this.yPos);
    }
	
	find_connections() {
	  //get name of partner
	  for (let i = 0; i < ActiveElements.length; i++) {
        let name = ActiveElements[i].report_name();
		//compares with his own partners
		for (let j = 0; j < this.partners.length; j++) {
		  if (name == this.partners[j]) {
		    this.connections.push(i);
		    break;
		  }
		}
      }
	  this.numberOfConnections = this.connections.length;
	}
	draw_lines() {
	  stroke(0);
	  strokeWeight(2);
	  for (let i=0; i < this.connections.length; i++) {
		let partnerNo = this.connections[i];
		let partnerX = ActiveElements[partnerNo].report_x();
		let partnerY = ActiveElements[partnerNo].report_y();
		line(this.xPos,this.yPos,partnerX,partnerY);
	  }
	}
	report_name() {
	  return this.name;
	}
	report_x() {
	  return this.xPos;
	}
	report_y() {
	  return this.yPos;
	}
	report_radius() {
	  return this.radius;
	}
	select(propagate) {
		this.redH = this.redHueSelected;
		this.greenH = this.greenHueSelected;
		this.blueH = this.blueHueSelected;
		if (propagate) {
			this.highlight_partners();
		}
	}
	deselect(propagate) {
		this.redH = this.normalRedHue;
		this.greenH = this.normalGreenHue;
		this.blueH = this.normalBlueHue;
		if (propagate) {
			this.dehighlight_partners();
		}
	}
	highlight_partners() {
	  for (let i=0; i < this.connections.length; i++) {
	    let partnerNo = this.connections[i];
		ActiveElements[partnerNo].select(0);
	  }
	}
	dehighlight_partners() {
	  for (let i=0; i < this.connections.length; i++) {
	    let partnerNo = this.connections[i];
		ActiveElements[partnerNo].deselect(0);
	  }
	}
	goToMouse() {
		let xDif = Math.abs(this.xPos - mouseX);
		let xSign = Math.sign(this.xPos - mouseX);
		let yDif = Math.abs(this.yPos - mouseY);
		let ySign = Math.sign(this.yPos - mouseY)
		//Slow dragging goes to mouse position
		if (xDif < 4) {
		  this.xPos = mouseX;
		}
		else {
		  this.xPos = this.xPos - ((xDif/3)*xSign)
		}
		if (yDif < 6) {
		  this.yPos = mouseY;
		}
		else {
		  this.yPos = this.yPos - ((yDif/3)*ySign)
		}
	}
	move() {
	  this.partner_attraction();
      this.everyone_repulsion();
	  if (temperature > 0) {
		  this.heat_movement();
	  }
      this.stay_within_bounds();
	}
	calculateVelocityAttraction(cordA,cordB) {
		console.log("CordA is" + cordA.toString());
		console.log("CordB is" + cordB.toString());
		let direction = Math.sign(cordA-cordB);
		let multiplier = 0.001;
		let velocity = direction * multiplier * Math.pow((cordA-cordB),2);
		console.log("Direction is:" + direction.toString());
		console.log("Multiplier is:" + multiplier.toString());
		console.log("Square is:" + Math.pow((cordA-cordB),2).toString());
		console.log("Velocity is:" + velocity.toString());
		if (Math.abs(velocity) > 50) {
			velocity = 50*direction;
		}
		if (Math.abs(velocity) < 0.1) {
			velocity = 0;
		}
		return scale*velocity;
	}

	
	calculateVelocityRepulsion(cordAX,cordAY,cordBX,cordBY) {
		console.log("Repulsion Active for x1:" + cordAX + "x2:" + cordBX);
		let cSquare = Math.pow((cordAX-cordBX),2)+Math.pow((cordAY-cordBY),2);
		//if the distance is larger than 100 pixels (squared) than no repulsion will be applied
		if (cSquare > distThresholdScaled) {
			return 0;
		}
		let direction = Math.sign(cordAX-cordBX);
		let multiplier = -4;
		let powerFraction = Math.pow((cordAX-cordBX),2)/(cSquare);
		let velocity = (direction * multiplier * powerFraction);

		if (Math.abs(velocity) > 50) {
			velocity = 50*direction;
		}
		if (Math.abs(velocity) < 0.1) {
			velocity = 0;
		}
		console.log("Velocity:" + velocity)
		return scale*velocity;
	}
	
	
	
	partner_attraction() {
		
		for (let i=0; i < this.connections.length; i++) {
	      let partnerNo = this.connections[i];
		  let partnerX = ActiveElements[partnerNo].report_x();
		  let partnerY = ActiveElements[partnerNo].report_y();
		  let xVelocity = 0;
		  console.log("xVelocity is originally a zero" + xVelocity.toString());
		  let yVelocity = 0;
		  if (this.xPos != partnerX) {
			xVelocity = this.calculateVelocityAttraction(this.xPos,partnerX);
			console.log("xVelocity is now a: " + xVelocity.toString());
		  }
		  if (this.yPos != partnerY) {
			yVelocity = this.calculateVelocityAttraction(this.yPos,partnerY);
		  }
		  //Divide by number of connections?
		  xVelocity = xVelocity / (this.connections.length*connection_discreditor);
		  console.log("xVelocity is after division a: " + xVelocity.toString());
		  yVelocity = yVelocity / (this.connections.length*connection_discreditor);
		
		console.log(xVelocity); //add temperature variable to accomodate randomness
		this.xPos = this.xPos - xVelocity;
		this.yPos = this.yPos - yVelocity;
		}
	}
	
	everyone_repulsion() {
		//distant repulsion is too significant, let it drop to zero after certain treshold
		for (let i=0; i < ActiveElements.length; i++) {
			let partnerName = ActiveElements[i].report_name();
			//console.log("Repulsion active for: " + partnerName);
			//Skip self
			if (partnerName == this.name) {
				continue;
			}
			//skips connected nodes, just testing, they should still have some way to repulse each other
			//temporary disable
			if (false) {
				let skip = false;
				for (let j=0; j < this.connections.length; j++) {
					let partnerNo = this.connections[j];
					let connectedName = ActiveElements[partnerNo].report_name();
					if (partnerName == connectedName) {
						skip = true;
						break;
					}
				}
				if (skip) {
					continue;
				}
			}
			
			let partnerX = ActiveElements[i].report_x();
			let partnerY = ActiveElements[i].report_y();
			let xVelocity = 0;
			let yVelocity = 0;
			if (this.xPos != partnerX) {
				xVelocity = this.calculateVelocityRepulsion(this.xPos,this.yPos,partnerX,partnerY);
			}
			if (this.yPos != partnerY) {
				yVelocity = this.calculateVelocityRepulsion(this.yPos,this.xPos,partnerY,partnerX);
			}
			this.xPos = this.xPos - xVelocity;
			this.yPos = this.yPos - yVelocity;
			
		}
	}
	heat_movement() {
		this.xPos = this.xPos + 2*temperature*(Math.random()-0.5);
		this.yPos = this.yPos + 2*temperature*(Math.random()-0.5);
	}

	
	stay_within_bounds() {
		let boundarySize = 40*scale;
		if (this.xPos < boundarySize) {
			this.xPos = boundarySize;
		}
		if (this.yPos < boundarySize) {
			this.yPos = boundarySize;
		}
		if (this.xPos > xmax - boundarySize) {
			this.xPos = xmax - boundarySize;
		}
		if (this.yPos > ymax - boundarySize) {
			this.yPos = ymax - boundarySize;
		}
	}
	
}
//end of active object


//button object
class Button{
	constructor(
  theType, theName,
  theRedHue, theGreenHue, theBlueHue,
  theRedHueSelected, theGreenHueSelected, theBlueHueSelected,
  theXpos, theYpos, theRadius,
  theDisplayedText
  ) {    
    //constructor
    this.type = theType;
    this.name = theName;
    this.normalRedHue = theRedHue;
    this.redH = theRedHue;
    this.normalGreenHue = theGreenHue;
    this.greenH = theGreenHue;
    this.NormalBlueHue = theBlueHue;
    this.blueH = theBlueHue;
    this.redHueSelected = theRedHueSelected;
    this.greenHueSelected = theGreenHueSelected;
    this.blueHueSelected = theBlueHueSelected;
    if (theXpos == null) {
      this.xPos = xmax - (scale*100);
      } else {
      this.xPos = theXpos * scale * 1975;
      }
    this.yPos = theYpos * scale * 1075;
    this.radius = theRadius;
    this.displayedText = theDisplayedText;
  }
    
    //class functions    
    display() {
      //ellipse part
      fill(this.redH,this.greenH,this.blueH);
      stroke(0);
      ellipse(this.xPos, this.yPos, this.radius*scale*1.3, this.radius*scale*1.3);
      
      //text handling, add text offset for small circles
      stroke(255);
      textSize(txtSize);
      fill(255);
      textAlign(CENTER);
      text(this.displayedText, this.xPos + ShadeOffset, this.yPos + ShadeOffset);
      fill(0);
      stroke(255);
      text(this.displayedText, this.xPos, this.yPos);
    }
	report_name() {
	  return this.name;
	}
	report_x() {
	  return this.xPos;
	}
	report_y() {
	  return this.yPos;
	}
	report_radius() {
	  return this.radius;
	}
	
	highlight() {
		this.redH = this.redHueSelected;
		this.greenH = this.greenHueSelected;
		this.blueH = this.blueHueSelected;
	}
	
	dehighlight() {
		this.redH = this.normalRedHue;
		this.greenH = this.normalGreenHue;
		this.blueH = this.normalBlueHue;
	}
}
//end of button


function preload() {
  jsonData = loadJSON('data.json');
}

function windowResized(){
	let previousScale = scale;
	rescale();
	resizeCanvas(xmax, ymax);
	let ratio = scale/previousScale;
	for (let i = 0; i < ActiveElements.length; i++) {
      ActiveElements[i].xPos = ActiveElements[i].xPos * ratio;
	  ActiveElements[i].yPos = ActiveElements[i].yPos * ratio;
	}
	for (let i = 0; i < Buttons.length; i++) {
      Buttons[i].xPos = xmax - (100*scale);
	  Buttons[i].yPos = Buttons[i].yPos * ratio;
	  console.log("buttons resized");
	}
}

function setup() {

  xmax = windowWidth - 5;
  ymax = windowHeight - 5;
  rescale();
  createCanvas(xmax, ymax);
  canvas.parent("sketch-holder");
  console.log(jsonData.elements.length);
  console.log(jsonData.buttons.length);
  //loads buttons
    for (let i = 0; i < jsonData.buttons.length; i++) {
    let d = jsonData.buttons[i];
    let buttn = new Button(
      d.type,
      d.name,
      d.normalRedHue,
      d.normalGreenHue,
      d.NormalBlueHue,
      d.redHueSelected,
      d.greenHueSelected,
      d.blueHueSelected,
      d.xPos,
      d.yPos,
      d.radius,
      d.displayedText
    );
    Buttons.push(buttn);  
  }
  //loads active elements
  for (let i = 0; i < jsonData.elements.length; i++) {
    let d = jsonData.elements[i];
    let element = new ActiveElement(
      d.type,
      d.name,
      d.normalRedHue,
      d.normalGreenHue,
      d.NormalBlueHue,
      d.redHueSelected,
      d.greenHueSelected,
      d.blueHueSelected,
      d.xPos,
      d.yPos,
      d.radius,
      d.displayedText,
      d.partners
    );
    ActiveElements.push(element);  
  }
  
//inicialize connections between objects 
  for (let i = 0; i < ActiveElements.length; i++) {
    ActiveElements[i].find_connections();
  }
//end of setup
}    

function clickBoundary() {
	let clickOutsideBoundary = "ClickOutside;none;-1";
	let difX = 0.0;
	let difY = 0.0;
	for (let i = 0; i < ActiveElements.length; i++) {
		let currentRadius = ActiveElements[i].report_radius();
		difX = ActiveElements[i].report_x() - mouseX;
		difY = ActiveElements[i].report_y() - mouseY;
		//test if click is withnin boundaries
		if (Math.sqrt(difX**2 + difY**2) < currentRadius/2) {
			return "clickIn;ActiveElement;" + i.toString();
		}
	}	
	for (let i = 0; i < Buttons.length; i++) {
		currentRadius = Buttons[i].report_radius();
		difX = Buttons[i].report_x() - mouseX;
		difY = Buttons[i].report_y() - mouseY;
		//test if click is withnin boundaries
		if (Math.sqrt(difX**2 + difY**2) < currentRadius/2) {
			return "clickIn;Button;" + i.toString();
		}
	}			
	return clickOutsideBoundary;
}
function activateButton(ButtonNo) {
	console.log(ButtonNo)
	switch (ButtonNo) {
	case "0":
	  playActive = !playActive;
	  if (playActive) {
		  Buttons[0].highlight();
	  }
	  else {
		  Buttons[0].dehighlight();
	  }
	  break
//	case "1":
	//  temperature = temperature + 1;
	//  break
//	case "2":
//	  if (temperature > 0) {
//		temperature = temperature - 1;
//	  }
//	  break
	case "1":
	  heatExperimentActive = !heatExperimentActive;
	  if (heatExperimentActive) {
		 Buttons[1].highlight();
	  }
	  else {
		 Buttons[1].dehighlight();
	  }
	  temperature = 100;
	}
}
function user_click() {
	if (mouseIsPressed) {
		//determine whether the click is valid
		//for element in elements check if click is inside boundary if yes, flag the element and go to misclick false, else set status to misclick and wait
		//you may not realize it but this click handling is so much better than in the first java based version, yet for some reason I deeply hate the fact that I have to rewrite this shit in javascript
		if (misclick == "unknown") {
			firstFrameOfClick = true;
			dragActive = false;
			let determiner = clickBoundary();
			const ClickParams = determiner.split(";");
			let clickState = ClickParams[0];
			let clickType = ClickParams[1];
			let clickNumber = ClickParams[2];
					
			if (clickState == "ClickOutside") {
				misclick = "true";
				//Deselect active element, don't affect buttons
				if (selectedByMouse == "ActiveElement") {
					ActiveElements[selectedNumber].deselect(1)
					selectedByMouse = "None";
					selectedNumber = -1;
				}
			}
			else {
				misclick = "false";
				if (clickType == "ActiveElement") {
					if (selectedNumber >= 0) {
						ActiveElements[selectedNumber].deselect(1)
					}
					selectedByMouse = "ActiveElement"
					selectedNumber = clickNumber;
					ActiveElements[selectedNumber].select(1);
					
				}
				if (clickType == "Button") {
					activateButton(clickNumber);
				}
				
				
			}
		}
		
		if (misclick == "true") {
			//do nothing
		}
		else if (misclick == "false") {
			if (!dragActive) {
				//special behaviour for firstFrameOfClick
				//1.save which object was clicked on
				//2.reset timer for drag behaviour
				if (firstFrameOfClick) {
					firstFrameOfClick = false;
					Click_timeStart = millis();
				}
				//count how many millis have pased
				else {
					if ((millis() - Click_timeStart) > dragThreshold) {
						dragActive = true;
					}
				}
			}
			else {
				ActiveElements[selectedNumber].goToMouse();
			//dragging behaviour
			}
		}
		//fix brackets bellow

		//mouse is already held
	}
	//if mouse not pressed, then set the misclick to unknown. The next time mouse is pressed we will determine the status of the click
	else {
		misclick = "unknown";
	}
}

function update_positions() {
  for (let i = 0; i < ActiveElements.length; i++) {
    ActiveElements[i].move();
  }
}

function check_scale() {
	if (xmax != windowWidth - 5 || ymax != windowHeight - 5) {
		rescale()
	}
}
function rescale() {
	//determine which size is smaler and set scale accordingly
	xmax = windowWidth -5;
	ymax = windowHeight -5;
	if (xmax / ymax < 1.83) {
		//Width is smaller
		scale = xmax / (1980 - 5);
	}
	else {
		//Height is smaller
		scale = ymax / (1080 - 5);
	txtSize = Math.round(scale*initialtxtSize);
	distThresholdScaled = Math.pow((100*scale),2);
	
	}
}

function draw() {
  background(120,255,255);
  fill(255,120,255);
  //heat experiment
  if (heatExperimentActive) {
	  if (temperature > 50) {
		  temperature = temperature - 0.1;
	  }
	  if (temperature > 25) {
		  temperature = temperature - 0.1;
	  }
	  temperature = temperature - 0.05;
	  if (temperature <= 0) {
		  Buttons[1].dehighlight();
		  heatExperimentActive = false;
		  Buttons[0].dehighlight();
		  playActive = false;
		  
	  }
  }
  fill(0);
  textAlign(LEFT);
  text("Temperature: "+temperature, xmax - 160*scale, ymax - 10*scale);
  //heat experiment//
// If play is active, update the positions of active elements

// Draw connecting lines if active
  if (drawLines) {
	for (let i = 0; i < ActiveElements.length; i++) {
      ActiveElements[i].draw_lines();
  }
  }
//	Draw active elements
  for (let i = 0; i < ActiveElements.length; i++) {
    ActiveElements[i].display();
  }
// Draw buttons
  for (let i = 0; i < Buttons.length; i++) {
    Buttons[i].display();
  }
//Calculate position based on attraction
if (playActive) {
	update_positions();
}
// Handle drag and drop of elements
user_click();
}
