/* Based on HTML5 Rocks Demo by Ilmari Heikkinen */
/* See: http://www.html5rocks.com/en/tutorials/webgl/jsartoolkit_webrtc/ */
(function() {

    var DETECTOR_THRESHOLD = 128;

    var CANVAS_WIDTH = 640;
    var CANVAS_HEIGHT = 480;

    var video;
    var canvas;
    var videoCanvas;
    var glCanvas;
    var canvasContext;
    var flarParam;

    var scene;
    var renderer;
    var loader;
    var model;

    var raster;
    var resultMat;
    var detector;

    var markers = {};
    var lastTime = 0;

    var videoTex;
    var videoScene;
    var videoCam;

    var camera;
    var tmp;


    window.DEBUG = true; // Means JSARToolkit will output to debugCanvas

    // For creating an object URL from the stream - for assigning the webcam stream to the video element
    var URL = window.URL || window.webkitURL;
    var createObjectURL = URL.createObjectURL || webkitURL.createObjectURL;


    var getUserMedia = function(t, onsuccess, onerror) {
        if (navigator.getUserMedia) {
            return navigator.getUserMedia(t, onsuccess, onerror);
        } else if (navigator.webkitGetUserMedia) {
            return navigator.webkitGetUserMedia(t, onsuccess, onerror);
        } else if (navigator.mozGetUserMedia) {
            return navigator.mozGetUserMedia(t, onsuccess, onerror);
        } else if (navigator.msGetUserMedia) {
            return navigator.msGetUserMedia(t, onsuccess, onerror);
        } else {
            onerror(new Error("No getUserMedia implementation found."));
        }
    };

    var setUpVideoElement = function() {

        video = document.createElement('video');
        video.width = CANVAS_WIDTH;
        video.height = CANVAS_HEIGHT;
        video.loop = true;
        video.volume = 0;
        video.autoplay = true;
        video.controls = true;

        // Hide video element - we should see it rendered on canvas
        video.style.display = 'none';

        $('#loading').hide();
        document.body.appendChild(video);

    };

    var feedWebCamToVideoElement = function() {

        // Get user media and assign to video element
        getUserMedia({'video': true},
            function(stream) {
                var url = createObjectURL(stream);
                video.src = url;
            },
            function(error) {
                alert("Couldn't access webcam.");
            }
        );

    };

    var setUpCanvases = function() {

        canvas = document.createElement('canvas');
        canvas.id = 'standardCanvas'; // Just for debugging
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);

        canvasContext = canvas.getContext('2d');
        canvasContext.font = "24px URW Gothic L, Arial, Sans-serif";

        console.log('set up video canvas');

        videoCanvas = document.createElement('canvas');
        videoCanvas.id = 'videoCanvas'; // Just for debugging
        videoCanvas.width = CANVAS_WIDTH;
        videoCanvas.height = CANVAS_HEIGHT;

        // JSARToolkit will pick this out from its ID
        var debugCanvas = document.createElement('canvas');
        debugCanvas.id = 'debugCanvas';
        debugCanvas.width = CANVAS_WIDTH;
        debugCanvas.height = CANVAS_HEIGHT;
        document.body.appendChild(debugCanvas);
    };

    var setUpJSARToolkit = function() {

        // Create a RGB raster object for the 2D canvas.
        // JSARToolKit uses raster objects to read image data.
        // Note that you need to set canvas.changed = true on every frame.
        raster = new NyARRgbRaster_Canvas2D(canvas);

        // FLARParam is the thing used by FLARToolKit to set camera parameters.
        // Here we create a FLARParam for images with 640x480 pixel dimensions.
        flarParam = new FLARParam(CANVAS_WIDTH,CANVAS_HEIGHT);

        resultMat = new NyARTransMatResult();

        // The FLARMultiIdMarkerDetector is the actual detection engine for marker detection.
        // It detects multiple ID markers. ID markers are special markers that encode a number.
        detector = new FLARMultiIdMarkerDetector(flarParam, 120);

        // For tracking video set continue mode to true. In continue mode, the detector
        // tracks markers across multiple frames.
        detector.setContinueMode(true);

    };

    var setUpScene = function() {

        scene = new THREE.Scene();

        var light = new THREE.PointLight(0xffffff);
        light.position.set(400, 500, 100);
        scene.add(light);

        var light = new THREE.PointLight(0xffffff);
        light.position.set(-400, -500, -100);
        scene.add(light);

        // Create a camera and a marker root object for your Three.js scene.
        camera = new THREE.Camera();
        scene.add(camera);

        loader = new THREE.JSONLoader();
        //loader.load( 'models/monster.js', function(geometry) {
        loader.load( 'models/trex.js', function(geometry) {

            var faceMaterial = new THREE.MeshFaceMaterial();

            model = new THREE.Mesh(geometry, faceMaterial);

            model.scale.set(6, 6, 6);

            //model.rotation.z = Math.PI;
            model.rotation.x = -Math.PI / 2;
            model.rotation.y = Math.PI / 2;

            //model.position.set(0, 0, -50);

            //scene.add( model );

        });

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
        renderer.autoClear = false;

        glCanvas = renderer.domElement;
        glCanvas.style.webkitTransform = 'scale(-1.0, 1.0)';
        glCanvas.width = CANVAS_WIDTH;
        glCanvas.height = CANVAS_HEIGHT;
        document.body.appendChild(glCanvas);

        tmp = new Float32Array(16);

        // Next we need to make the Three.js camera use the FLARParam matrix.
        flarParam.copyCameraMatrix(tmp, 10, 10000);
        camera.projectionMatrix.setFromArray(tmp);

        videoTex = new THREE.Texture(videoCanvas);

        // Create scene and quad for the video.
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2, 0),
            new THREE.MeshBasicMaterial({map: videoTex})
        );

        plane.material.depthTest = false;
        plane.material.depthWrite = false;

        videoCam = new THREE.Camera();
        videoScene = new THREE.Scene();

        videoScene.add(plane);
        videoScene.add(videoCam);

        setInterval(updateScene, 1000); // XXX Every 15ms?

    };

    var updateScene = function() {

        console.log('Update');

        if( video.ended ) {
            video.play();
        }

        if( video.paused || window.paused || video.currentTime == lastTime ) {
            return;
        }

        if( video.currentTime == video.duration ) {
            video.currentTime = 0;
        }

        lastTime = video.currentTime;

        //console.log('Last time: ', lastTime);

        //console.log('does video canvas exist now? ' + videoCanvas, $('#videoCanvas').length);

        videoCanvas.getContext('2d').drawImage(video,0,0);

        canvasContext.drawImage(videoCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        canvas.changed = true;
        videoTex.needsUpdate = true;

        var detected = detector.detectMarkerLite(raster, DETECTOR_THRESHOLD);

        console.log('Detected', detected);

        // Go through detected markers
        // NB. It seems markers do not need to be defined? It will recognise any image with thick black border?
        for( var idx = 0; idx < detected; idx++ ) {

            var id = detector.getIdMarkerData(idx);

            var currId;

            if( id.packetLength > 4 ) {
                currId = -1;
            } else {
                currId = 0;
                for( var i = 0; i < id.packetLength; i++ ) {
                    currId = (currId << 8) | id.getPacketData(i);
                }
            }

            if( !markers[currId] ) {
                markers[currId] = {};
            }

            detector.getTransformMatrix(idx, resultMat);

            markers[currId].age = 0;
            markers[currId].transform = Object.asCopy(resultMat);
        }

        //console.log('Markers', markers);

        for( var i in markers ) {

            var r = markers[i];

            if (r.age > 1) {
                delete markers[i];
                scene.remove(r.model);
            }

            r.age++;
        }

        //console.log('After removing, markers: ', markers);

        for( var i in markers ) {

            var m = markers[i];

            //console.log('m.model', m.model);

            // If 3D model not created yet?
            //if( !m.model ) {
            if( !m.model && model != undefined ) {

                //console.log('Set marker model');

                m.model = new THREE.Object3D();

                var cube = new THREE.Mesh(
                    new THREE.CubeGeometry(100,100,100),
                    new THREE.MeshLambertMaterial({color: 0|(0xffffff*Math.random())})
                );

                //cube.position.z = -50;
                //cube.doubleSided = true;

                //model.position.z = -50;

                m.model.matrixAutoUpdate = false;

                //m.model.add(cube);
                m.model.add(model);

                //console.log('Adding to scene:', m.model);

                scene.add(m.model);
            }

            copyMatrix(m.transform, tmp);

            m.model.matrix.setFromArray(tmp);
            m.model.matrixWorldNeedsUpdate = true;
        }

        //console.log('Render scene');

        renderer.clear();
        renderer.render(videoScene, videoCam);
        renderer.render(scene, camera);

    };

    var init = function() {

        setUpVideoElement();

        feedWebCamToVideoElement();

        setUpCanvases();

        setUpJSARToolkit();

        setUpScene();

    };

    THREE.Matrix4.prototype.setFromArray = function(m) {
        return this.set(
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        );
    };

    var copyMatrix = function(mat, cm) {
        cm[0] = mat.m00;
        cm[1] = -mat.m10;
        cm[2] = mat.m20;
        cm[3] = 0;
        cm[4] = mat.m01;
        cm[5] = -mat.m11;
        cm[6] = mat.m21;
        cm[7] = 0;
        cm[8] = -mat.m02;
        cm[9] = mat.m12;
        cm[10] = -mat.m22;
        cm[11] = 0;
        cm[12] = mat.m03;
        cm[13] = -mat.m13;
        cm[14] = mat.m23;
        cm[15] = 1;
    };

    $(function() {

        init();

    });

})();
