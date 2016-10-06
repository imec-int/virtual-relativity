function setPos(x, y, z) {
    "use strict";
    tie.setAttribute('position', {
        x: x,
        y: y,
        z: z
    });
}

function initColladaModels() {
    "use strict";
    var i, throttleHandle;
    document.addEventListener('model-loaded', function (evt) {
        console.log(evt.target.object3D);
        if (evt.target.id == "tie") { //==
            // setTimeout(function(){
        
            // },2000)
            console.log("Ship loaded");
            var ship = evt.target.object3D.children[0].children[0].children[0];
            ship.geometry.computeVertexNormals();
            // make it shiny
            for (i = 0; i < ship.material.materials.length; i++) {
                ship.material.materials[i].specular = {r: 0.2, g: 0.2, b: 0.25};
                if (ship.material.materials[i].name == "RRSilver") {
                    ship.material.materials[i].specular = {r: 0.3, g: 0.3, b: 0.4};
                }
            }
        } else if (evt.target.id == "throttle-handle") {
            throttleHandle = evt.target.object3D.children[0].children[0].children[0];
            // console.log(evt.target.object3D.children[0].children[0]);
            // throttleHandle.geometry.computeVertexNormals();
        }
    });
}
/*Mouse input section*/
function initMouseInput() {
    "use strict";
    document.addEventListener('mousewheel', function (e) {
    //console.log("scroll",e);
        var speed = parseFloat(document.querySelector('#videosphere').getAttribute("lightspeed"));
        speed += e.wheelDelta * -0.001;
        if (speed > 0.99) { speed = 0.99; }
        if (speed < 0.01) { speed = 0.01; }
        document.querySelector('#videosphere').setAttribute("lightspeed", speed);
    
        if (document.querySelector('#videosphere').object3D.el.components.material.material.__webglShader!= undefined) {
            // change speedvector of videosphere material
            document.querySelector('#videosphere').object3D.el.components.material.material.speedvector.y = speed;
            // change speed dial
            // console.log(data, );
            document.querySelector('#speed').setAttribute("rotation", "0 0 " + (252 * speed + 36));
            document.querySelector('#throttle').setAttribute("rotation", (40 * speed - 20) + " 0 0");
        }
    });
}
/****************************************************
 *Joystick input section
 ****************************************************/
/*
 * gamepad object:
 * Gamepad ID: vendor and model information
 * variables: 
 * axes: returns array with absolute values per each axis attached/scanned
 * buttons: returns array with 0 or 1 values depending on button (not) pressed
 * connected: boolean
 * id: Model + hex vendor + hex Product code
 * index: number of attached joystick/gamepad
 * mapping: if differing from standard mapping
 * timestamp: timestamp since last change in values
    * e.g.
    * Gamepad {id: "T.Flight Hotas X (Vendor: 044f Product: b108)", index: 0, connected: true, timestamp: 15901450798896, mapping: ""…}
    * axes : Array[10]
    * buttons : Array[12]
    * connected : true
    * id : "T.Flight Hotas X (Vendor: 044f Product: b108)"
    * index : 0
    * mapping : ""
    * timestamp : 15901450798896
    * __proto__ : Gamepad
 */
var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controller = {};
var scanInterval = 0;
var rAF = window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.requestAnimationFrame;

/*
 * Functions to create/delete object for gamepads
 */
function addgamepad(gamepad) {
    "use strict";
    controller = gamepad;
    clearInterval(scanInterval);
    rAF(updateStatus);
}
function removegamepad(gamepad) {
    "use strict";
    controller = undefined;
}
/*
 * Scan list of attached gamepads (we only check 1 and append it to controller, if more available, controller should be array!)
 */
function scangamepads() {
    "use strict";
    var i, gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            addgamepad(gamepads[i]);
            break;
        }
    }
}
/*
 * connection blocks:
 */
function connecthandler(e) {
    "use strict";
    addgamepad(e.gamepad);
}
function disconnecthandler(e) {
    "use strict";
    removegamepad(e.gamepad);
}
/*
 * main functions to get position of gamepad
 */
function updateSpeed(e) {
    "use strict";
    var speed = parseFloat(document.querySelector('#videosphere').getAttribute("lightspeed"));
    //Alter speed with -1.0..1.0 from 2nd-axis ==> mapped on 0..1
    speed = (controller.axes[2] + 1) * 0.5;
    if (speed > 0.99) {speed = 0.99; }
    if (speed < 0.01) {speed = 0.01; }
    document.querySelector('#videosphere').setAttribute("lightspeed", speed);
        
    if (document.querySelector('#videosphere').object3D.el.components.material.material.__webglShader!= undefined) {
        // change speedvector of videosphere material
        document.querySelector('#videosphere').object3D.el.components.material.material.speedvector.y = speed;
        // change speed dial
        document.querySelector('#speed').setAttribute("rotation", "0 0 " + (252 * speed + 36));
        document.querySelector('#throttle').setAttribute("rotation", (40 * speed - 20) + " 0 0");
    }
}
function updateStatus() {
    "use strict";
    if (controller) {
        updateSpeed();
    }
    rAF(updateStatus);
}
/*
 * Init functions, listens for events of gamepad and connects if possible
 * setInterval checks sporadically for attached gamepads, until scanInterval gets cleared and it is clear that a gamepad is attached. (gets cleared in addgamepad())
 */
function InitJoystick() {
    "use strict";
    if (haveEvents) {
        window.addEventListener("gamepadconnected", connecthandler);
        window.addEventListener("gamepaddisconnected", disconnecthandler);
    } else if (haveWebkitEvents) {
        window.addEventListener("webkitgamepadconnected", connecthandler);
        window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
    } else {
        scanInterval = setInterval(scangamepads, 500);
    }
}


// groupObject3D = document.querySelector('#tie').object3D;
// groupObject3D.position.x=49
// groupObject3D.position.y=0
// groupObject3D.position.z=-100
// var ship = document.querySelector('#tie').object3D;
// ship.scale.multiplyScalar(2);
// ship.position.x = 0.17;
// ship.position.y = 1.1;
// ship.position.z = 0.25;

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @returns {object} data - Processed material data.
 */
function getMaterialData(data) {
    "use strict";
    var newData = {
            color: new THREE.Color(data.color),
            fog: data.fog,
            metalness: data.metalness,
            roughness: data.roughness,
	        speedvector: data.speedvector
        };

    if (data.normalMap) { newData.normalScale = data.normalScale; }

    if (data.ambientOcclusionMap) { newData.aoMapIntensity = data.ambientOcclusionMapIntensity; }

    if (data.displacementMap) {
        newData.displacementScale = data.displacementScale;
        newData.displacementBias = data.displacementBias;
    }

    return newData;
}

/**
 * Standard (physically-based) shader using THREE.MeshStandardMaterial.
 */
AFRAME.registerShader('hello-relativistic-world-shader', {
    schema: {
        ambientOcclusionMap: {default: ''},
        ambientOcclusionMapIntensity: {default: 1},
        ambientOcclusionTextureOffset: {default: ''},
        ambientOcclusionTextureRepeat: {default: ''},

        color: {type: 'color'},

        displacementMap: {default: ''},
        displacementScale: {default: 1},
        displacementBias: {default: 0.5},
        displacementTextureOffset: {default: ''},
        displacementTextureRepeat: {default: ''},
        envMap: {default: ''},

        fog: {default: true},
        height: {default: 256},
        metalness: {default: 0.0, min: 0.0, max: 1.0},

        normalMap: {default: ''},
        normalScale: {type: 'vec2', default: '1 1'},
        normalTextureOffset: {default: ''},
        normalTextureRepeat: {default: ''},

        repeat: {default: ''},
        roughness: {default: 0.5, min: 0.0, max: 1.0},
        sphericalEnvMap: {default: ''},
        src: {default: ''},
        width: {default: 512},

        speedvector: {
            type: 'vec3',
            default: { x: 0.001, y: 0, z: 0 }
        },
    },
   

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
    init: function (data) {
        "use strict";
        this.material = new MyMaterial(getMaterialData(data));
        AFRAME.utils.material.updateMap(this, data);
        if (data.normalMap) { AFRAME.utils.material.updateDistortionMap('normal', this, data); }
        if (data.displacementMap) { AFRAME.utils.material.updateDistortionMap('displacement', this, data); }
        if (data.ambientOcclusionMap) { AFRAME.utils.material.updateDistortionMap('ambientOcclusion', this, data); }
        this.updateEnvMap(data);
    },

    update: function (data) {
        "use strict";
        this.updateMaterial(data);
        AFRAME.utils.material.updateMap(this, data);
        if (data.normalMap) { AFRAME.utils.material.updateDistortionMap('normal', this, data); }
        if (data.displacementMap) { AFRAME.utils.material.updateDistortionMap('displacement', this, data); }
        if (data.ambientOcclusionMap) { AFRAME.utils.material.updateDistortionMap('ambientOcclusion', this, data); }
        this.updateEnvMap(data);
    },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   * @returns {object} Material.
   */
    updateMaterial: function (data) {
        "use strict";
        var material = this.material;
        data = getMaterialData(data);
        Object.keys(data).forEach(function (key) {
            material[key] = data[key];
        });
    },

  /**
   * Handle environment cubemap. Textures are cached in texturePromises.
   */
    updateEnvMap: function (data) {
        "use strict";
        var self = this;
        var material = this.material;
        var envMap = data.envMap;
        var sphericalEnvMap = data.sphericalEnvMap;

        // No envMap defined or already loading.
        if ((!envMap && !sphericalEnvMap) || this.isLoadingEnvMap) {
            material.envMap = null;
            material.needsUpdate = true;
            return;
        }
        this.isLoadingEnvMap = true;

        // if a spherical env map is defined then use it.
        if (sphericalEnvMap) {
            this.el.sceneEl.systems.material.loadTexture(sphericalEnvMap, { src: sphericalEnvMap }, function textureLoaded(texture) {
                self.isLoadingEnvMap = false;
                texture.mapping = THREE.SphericalReflectionMapping;
                material.envMap = texture;
                utils.material.handleTextureEvents(self.el, texture);
                material.needsUpdate = true;
            });
            return;
        }

        // Another material is already loading this texture. Wait on promise.
        if (texturePromises[envMap]) {
            texturePromises[envMap].then(function (cube) {
                self.isLoadingEnvMap = false;
                material.envMap = cube;
                utils.material.handleTextureEvents(self.el, cube);
                material.needsUpdate = true;
            });
          return;
    }

    // Material is first to load this texture. Load and resolve texture.
    texturePromises[envMap] = new Promise(function (resolve) 
	{
      AFRAME.utils.srcLoader.validateCubemapSrc(envMap, function loadEnvMap (urls) 
	  {
        CubeLoader.load(urls, function (cube) 
		{
          // Texture loaded.
          self.isLoadingEnvMap = false;
          material.envMap = cube;
          utils.material.handleTextureEvents(self.el, cube);
          resolve(cube);
        });
      });
    });
  },

});



/************************************
 * MAIN FUNCTIONS
 ************************************/

var CubeLoader = new THREE.CubeTextureLoader();
var texturePromises = {};
initColladaModels();
/*choose attached input*/
initMouseInput();
//InitJoystick();
