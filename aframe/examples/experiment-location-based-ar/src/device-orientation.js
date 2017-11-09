AFRAME.registerComponent('compass-rotation', {
	
	lookControls: null,
	lastTimestamp: 0,
	heading: null,
	
	
	schema: {
		maxTime: {
			type: 'int',
			default: 2000
		},
		orientationEvent: {	// TODO do i need this ?
			type: 'string',
			default: 'auto'
		}
	},
	
	init: function () {
		
		if( this.el.components['look-controls'] === undefined ) return
		
		this.lookControls = this.el.components['look-controls']
		
		this.handlerOrientation = this.handlerOrientation.bind(this)
		
		if( this.data.orientationEvent === 'auto' ){
			if('ondeviceorientationabsolute' in window){
				this.data.orientationEvent = 'deviceorientationabsolute'
			}else if('ondeviceorientation' in window){
				this.data.orientationEvent = 'deviceorientation'
			}else{
				this.data.orientationEvent = ''
				alert('Compass not supported')
				return
			}
		}
		
		window.addEventListener( this.data.orientationEvent, this.handlerOrientation, false)
		
		window.addEventListener('compassneedscalibration', function(event) {
			alert('Your compass needs calibrating! Wave your device in a figure-eight motion')
			event.preventDefault()
		}, true)
		
	},
	
	tick: function( time, timeDelta ){
		
		if(this.heading === null || this.lastTimestamp > (time - this.data.maxTime)) return
		
		this.lastTimestamp = time
		this._updateRotation()
		
	},
	
	_computeCompassHeading: function (alpha, beta, gamma) {
		
		// Convert degrees to radians
		var alphaRad = alpha * (Math.PI / 180)
		var betaRad = beta * (Math.PI / 180)
		var gammaRad = gamma * (Math.PI / 180)
		
		// Calculate equation components
		var cA = Math.cos(alphaRad)
		var sA = Math.sin(alphaRad)
		var cB = Math.cos(betaRad)
		var sB = Math.sin(betaRad)
		var cG = Math.cos(gammaRad)
		var sG = Math.sin(gammaRad)
		
		// Calculate A, B, C rotation components
		var rA = - cA * sG - sA * sB * cG
		var rB = - sA * sG + cA * sB * cG
		var rC = - cB * cG
		
		// Calculate compass heading
		var compassHeading = Math.atan(rA / rB)
		
		// Convert from half unit circle to whole unit circle
		if(rB < 0) {
			compassHeading += Math.PI
		}else if(rA < 0) {
			compassHeading += 2 * Math.PI
		}
		
		// Convert radians to degrees
		compassHeading *= 180 / Math.PI
		
		return compassHeading
	},
	
	handlerOrientation: function( event ){
		
		var heading = null
		
		//console.log('device orientation event', event)
		
		if( event.webkitCompassHeading  !== undefined ){
			
			if(event.webkitCompassAccuracy < 50){
				heading = event.webkitCompassHeading
			}else{
				console.warn('webkitCompassAccuracy is event.webkitCompassAccuracy')
			}
			
		}else if( event.alpha !== null ){
			if(event.absolute === true || event.absolute === undefined ) {
				heading = this._computeCompassHeading(event.alpha, event.beta, event.gamma)
			}else{
				console.warn('event.absolute === false')
			}
		}else{
			console.warn('event.alpha === null')
		}
		
		this.heading = heading	
	},
	
	_updateRotation: function() {
		
		/*
		camera.components["look-controls"].yawObject.rotation.y = THREE.Math.degToRad(
			(
				360
				- camera.components["compass-rotation"].heading
				- (
					camera.getAttribute('rotation').y
					- THREE.Math.radToDeg(camera.components["look-controls"].yawObject.rotation.y)
				)
			)
			% 360
		)
		*/
		
		
		var heading = 360 - this.heading
		var camera_rotation = this.el.getAttribute('rotation').y
		var yaw_rotation = THREE.Math.radToDeg(this.lookControls.yawObject.rotation.y)
		
		var offset = ( heading - ( camera_rotation - yaw_rotation ) ) % 360
		
		this.lookControls.yawObject.rotation.y = THREE.Math.degToRad(offset)
		
	},
	
	remove: function () {
		if(this.data.orientationEvent){			
			window.removeEventListener(this.data.orientationEvent, this.handlerOrientation, false)
		}
	}
	
})
