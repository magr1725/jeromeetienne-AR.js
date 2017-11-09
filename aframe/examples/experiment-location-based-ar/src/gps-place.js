AFRAME.registerComponent('gps-place', {
	
	_cameraGpsPosition: null,
	_deferredInitInterval: 0,
	
	schema: {
		location: {
			type: 'string',
			default: 'a-camera, [camera]'
		}
		latitude: {
			type: 'number',
			default: 0
		},
		longitude: {
			type: 'number',
			default: 0
		},
		cameraSelector: {	// TODO do i need this ?
			type: 'string',
			default: 'a-camera, [camera]'
		}
	},
	
	init: function () {
		// TODO use a ._initialized = true instead
		if( this._deferredInit() ) return
		
		this._deferredInitInterval = setInterval(this._deferredInit.bind(this), 100)
	},
	
	_deferredInit: function () {
		
		if( this._cameraGpsPosition === null ){
			var camera = document.querySelector(this.data.cameraSelector)
			if(typeof(camera.components['gps-position']) == 'undefined') return
			this._cameraGpsPosition = camera.components['gps-position']
		}
		
		if( this._cameraGpsPosition.originCoords === null ) return
		
		this._updatePosition()
		
		clearInterval(this._deferredInitInterval)
		this._deferredInitInterval = 0
		
		return true
	},
	
	_updatePosition: function() {
		
		var position = {x: 0, y: 0, z: 0}
		
		// update position.x
		var dstCoords = {
			longitude: this.data.longitude,
			latitude: this._cameraGpsPosition.originCoords.latitude
		}
		position.x = this._cameraGpsPosition.computeDistanceMeters( this._cameraGpsPosition.originCoords, dstCoords )
		position.x *= this.data.longitude > this._cameraGpsPosition.originCoords.longitude ? 1 : -1
		
		// update position.z
		var dstCoords = {
			longitude: this._cameraGpsPosition.originCoords.longitude,
			latitude: this.data.latitude
		}
		position.z = this._cameraGpsPosition.computeDistanceMeters(this._cameraGpsPosition.originCoords, dstCoords)
		position.z *= this.data.latitude > this._cameraGpsPosition.originCoords.latitude	? -1 : 1
		
		// update element's position
		this.el.setAttribute('position', position)
	}
})
