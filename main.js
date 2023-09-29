import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

var camera, scene, renderer, labelRenderer, stats, gui, meshPsiPoint;
var geometry, group, psiGroup, psiDiv;
var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rotationsToApply = []

const gates = {

    'Hadamard Gate': function () {
        rotationsToApply = [...rotationsToApply, {type: "h", count: 180}]
    },
    'Pauli X Gate': function () {
        rotationsToApply = [...rotationsToApply, {type: "x", count: 180}]
    },
    'Pauli Y Gate': function () {
        rotationsToApply = [...rotationsToApply, {type: "y", count: 180}]
    },
    'Pauli Z Gate': function () {
        rotationsToApply = [...rotationsToApply, {type: "z", count: 180}]
    },
    'S (Phase) Gate': function () {
        rotationsToApply = [...rotationsToApply, {type: "z", count: 90}]
    },
    'T Gate': function () {
        rotationsToApply = [...rotationsToApply, {type: "z", count: 45}]
    }

};

let measurement = {
    measurementBasis : 0,
    outputA : "P(|0〉) = 1",
    outputB : "P(|1〉) = 0"
}

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.up = new THREE.Vector3(0,0,1);
    camera.position.x = 500;
    camera.position.y = 500;
    camera.position.z = 500;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2b2b2b);
    scene.fog = new THREE.Fog(0x2b2b2b, 1, 10000);
    var geometry = new THREE.SphereGeometry(100, 100, 100);

    var material = new THREE.MeshNormalMaterial();
    material.opacity = .5;
    material.transparent = true;
    group = new THREE.Group();
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);


    const pointsLineX = []
    pointsLineX.push(new THREE.Vector3(-200, 0, 0))
    pointsLineX.push(new THREE.Vector3(0, 0, 0))
    pointsLineX.push(new THREE.Vector3(400, 0, 0))
    var geometryLineX = new THREE.BufferGeometry().setFromPoints(pointsLineX)
    var materialLineX = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var lineX = new THREE.Line( geometryLineX, materialLineX );

    const pointsLineY = []
    pointsLineY.push(new THREE.Vector3(0, -200, 0))
    pointsLineY.push(new THREE.Vector3(0, 0, 0))
    pointsLineY.push(new THREE.Vector3(0, 400, 0))
    var geometryLineY = new THREE.BufferGeometry().setFromPoints(pointsLineY)
    var materialLineY = new THREE.LineBasicMaterial( { color : 0x00ff00 } );
    var lineY = new THREE.Line( geometryLineY, materialLineY );

    const pointsLineZ = []
    pointsLineZ.push(new THREE.Vector3(0, 0, -200))
    pointsLineZ.push(new THREE.Vector3(0, 0, 0))
    pointsLineZ.push(new THREE.Vector3(0, 0, 400))
    var geometryLineZ = new THREE.BufferGeometry().setFromPoints(pointsLineZ)
    var materialLineZ = new THREE.LineBasicMaterial( { color : 0x0000ff } );
    var lineZ = new THREE.Line( geometryLineZ, materialLineZ );

    var curveX = new THREE.EllipseCurve(0, 0, 101, 101);
    var pointsX = curveX.getSpacedPoints( 100 );
    var geometryX = new THREE.BufferGeometry().setFromPoints(pointsX)
    var materialX = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var curveLineX = new THREE.Line( geometryX, materialX );
    curveLineX.rotateY(Math.PI/2);

    var curveY = new THREE.EllipseCurve(0, 0, 101, 101);
    var pointsY = curveY.getSpacedPoints( 100 );
    var geometryY = new THREE.BufferGeometry().setFromPoints(pointsY)
    var materialY = new THREE.LineBasicMaterial( { color : 0x00ff00 } );
    var curveLineY = new THREE.Line( geometryY, materialY );
    curveLineY.rotateX(Math.PI/2);

    var curveZ = new THREE.EllipseCurve(0, 0, 101, 101);
    var pointsZ = curveZ.getSpacedPoints( 100 );
    var geometryZ = new THREE.BufferGeometry().setFromPoints(pointsZ)
    var materialZ = new THREE.LineBasicMaterial( { color : 0x0000ff } );
    var curveLineZ = new THREE.Line( geometryZ, materialZ);


    let bases = new THREE.Group();
    const basis0Div = document.createElement( 'div' );
    basis0Div.className = 'label';
    //〈〉
    const basis0Label = new CSS2DObject( basis0Div );
    basis0Div.textContent = '|0〉';
    basis0Label.position.set(0, 0, 120 );
    basis0Label.center.set( .5, .5 );

    const basis1Div = document.createElement( 'div' );
    basis1Div.className = 'label';
    //〈〉
    const basis1Label = new CSS2DObject( basis1Div );
    basis1Div.textContent = '|1〉';
    basis1Label.position.set(0, 0, -120 );
    basis1Label.center.set( .5, .5 );

    const basisPlusDiv = document.createElement( 'div' );
    basisPlusDiv.className = 'label';
    //〈〉
    const basisPlusLabel = new CSS2DObject( basisPlusDiv );
    basisPlusDiv.textContent = '|+〉';
    basisPlusLabel.position.set(120, 0, 0 );
    basisPlusLabel.center.set( .5, .5 );

    const basisMinusDiv = document.createElement( 'div' );
    basisMinusDiv.className = 'label';
    //〈〉
    const basisMinusLabel = new CSS2DObject( basisMinusDiv );
    basisMinusDiv.textContent = '|-〉';
    basisMinusLabel.position.set(-120, 0, 0 );
    basisMinusLabel.center.set( .5, .5 );

    const basisPlusIDiv = document.createElement( 'div' );
    basisPlusIDiv.className = 'label';
    //〈〉
    const basisPlusILabel = new CSS2DObject( basisPlusIDiv );
    basisPlusIDiv.textContent = '|i〉';
    basisPlusILabel.position.set(0, 120, 0 );
    basisPlusILabel.center.set( .5, .5 );

    const basisMinusIDiv = document.createElement( 'div' );
    basisMinusIDiv.className = 'label';
    //〈〉
    const basisMinusILabel = new CSS2DObject( basisMinusIDiv );
    basisMinusIDiv.textContent = '|-i〉';
    basisMinusILabel.position.set(0, -120, 0 );
    basisMinusILabel.center.set( .5, .5 );
    
    bases.add(basis0Label)
    bases.add(basis1Label)
    bases.add(basisPlusLabel)
    bases.add(basisMinusLabel)
    bases.add(basisPlusILabel)
    bases.add(basisMinusILabel)


    psiGroup = new THREE.Group();
    const pointsLinePsi = []
    pointsLinePsi.push(new THREE.Vector3(0, 0, 0))
    pointsLinePsi.push(new THREE.Vector3(0, 0, 89))
    pointsLinePsi.push(new THREE.Vector3(0, 0, 90))
    pointsLinePsi.push(new THREE.Vector3(0, 0, 110))
    var geometryPsi = new THREE.BufferGeometry().setFromPoints(pointsLinePsi)
    var materialPsi = new MeshLineMaterial( { color : 0xffffff } );
    var linePsi = new MeshLine();
    linePsi.setGeometry(geometryPsi, p => (p>.5)?10:3)
    var meshPsi = new THREE.Mesh(linePsi, materialPsi);
    
    
    var meshPsiPointGeometry = new THREE.SphereGeometry(5, 5, 5);
    var meshPsiPointMaterial = new THREE.MeshNormalMaterial();
    meshPsiPointMaterial.opacity = .5;
    meshPsiPointMaterial.transparent = true;
    meshPsiPoint = new THREE.Mesh(meshPsiPointGeometry, meshPsiPointMaterial);
    meshPsiPoint.position.x = 0;
    meshPsiPoint.position.y = 0;
    meshPsiPoint.position.z = 100;

    psiDiv = document.createElement( 'div' );
    psiDiv.className = 'label-psi';

    const psiLabel = new CSS2DObject( psiDiv );
    psiDiv.textContent = 'Ψ';
    psiLabel.position.set(0, 0, 75 );
    psiLabel.center.set( -.25, 0 );

    psiGroup.add(meshPsi)
    psiGroup.add(psiLabel)
    psiGroup.add(meshPsiPoint)



    group.add(lineX);
    group.add(lineY);
    group.add(lineZ);
    group.add(curveLineX)
    group.add(curveLineY);
    group.add(curveLineZ);
    group.add(bases);
    group.add(psiGroup);


    scene.add(group);

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild( labelRenderer.domElement );

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    const controls = new OrbitControls( camera, labelRenderer.domElement );
    controls.minDistance = 500;
    controls.maxDistance = 1000;

    initGui()
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 10;
    mouseY = (event.clientY - windowHalfY) * 10;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {

    camera.lookAt(scene.position);

    var quaternionHadamard = new THREE.Quaternion();
    var quaternionX = new THREE.Quaternion();
    var quaternionY = new THREE.Quaternion();
    var quaternionZ = new THREE.Quaternion();
    quaternionHadamard.setFromAxisAngle( new THREE.Vector3( 1/Math.sqrt(2),0,1/Math.sqrt(2)), Math.PI / 180 );
    quaternionX.setFromAxisAngle( new THREE.Vector3( 1,0,0 ), Math.PI / 180 );
    quaternionY.setFromAxisAngle( new THREE.Vector3( 0,1,0 ), Math.PI / 180 );
    quaternionZ.setFromAxisAngle( new THREE.Vector3( 0,0,1 ), Math.PI / 180 );


    rotationsToApply = rotationsToApply.filter(r=>r.count != 0)
    var rotationToApply = rotationsToApply[0]

    if(rotationToApply != null){
        if(rotationToApply.type == "h"){
            psiGroup.applyQuaternion(quaternionHadamard)
        } else if(rotationToApply.type == "x"){
            psiGroup.applyQuaternion(quaternionX)
        } else if (rotationToApply.type == "y"){
            psiGroup.applyQuaternion(quaternionY)
        } else if(rotationToApply.type == "z"){
            psiGroup.applyQuaternion(quaternionZ)
        }

        rotationsToApply[0].count-=1;
        //console.log(psiGroup.quaternion)
    }

    /*if(Math.abs(psiGroup.quaternion.x) < Math.abs(quaternionsToApply.x)){
        psiGroup.quaternion.x=psiGroup.quaternion.x+(quaternionsToApply.x/Math.abs(quaternionsToApply.x))*rate;
    }

    if(Math.abs(psiGroup.quaternion.y) < Math.abs(quaternionsToApply.y)){
        psiGroup.quaternion.y=psiGroup.quaternion.y+(quaternionsToApply.y/Math.abs(quaternionsToApply.y))*rate;
    }

    if(Math.abs(psiGroup.quaternion.z) < Math.abs(quaternionsToApply.z)){
        console.log(psiGroup.quaternion)
        psiGroup.quaternion.z=psiGroup.quaternion.z+(quaternionsToApply.z/Math.abs(quaternionsToApply.z))*rate;
    }*/

    let vector = new THREE.Vector3();
    vector.setFromMatrixPosition( meshPsiPoint.matrixWorld )

    let object = new THREE.Object3D()

    console.log(
        
    )

    if (measurement.measurementBasis == 0) {
        measurement.outputA = "P(|0〉) = "+ Math.abs((1-(1 - (vector.z/100))/2)).toFixed(3);
        measurement.outputB = "P(|1〉) = "+ Math.abs(((1 - (vector.z/100))/2)).toFixed(3);
    }
    else if (measurement.measurementBasis == 1) {
        measurement.outputA = "P(|+〉) = "+ Math.abs((1-(1 - (vector.x/100))/2)).toFixed(3);
        measurement.outputB = "P(|-〉) = "+ Math.abs(((1 - (vector.x/100))/2)).toFixed(3);
    }
    else if (measurement.measurementBasis == 2) {
        measurement.outputA = "P(|i〉) = "+ Math.abs((1-(1 - (vector.y/100))/2)).toFixed(3);
        measurement.outputB = "P(|-i〉) = "+ Math.abs(((1 - (vector.y/100))/2)).toFixed(3);
    }

    group.rotation.x = 0*Math.PI/6;
    group.rotation.y = 0;
    group.rotation.z = 0;
    renderer.render(scene, camera);
    labelRenderer.render( scene, camera );

    
}

function initGui() {

    gui = new GUI();

    gui.title( 'Qubit Simulator' );

    const gatesFolder = gui.addFolder( 'Gates' );
    gatesFolder.add( gates, 'Hadamard Gate' );
    gatesFolder.add( gates, 'Pauli X Gate' );
    gatesFolder.add( gates, 'Pauli Y Gate' );
    gatesFolder.add( gates, 'Pauli Z Gate' );
    gatesFolder.add( gates, 'S (Phase) Gate' );
    gatesFolder.add( gates, 'T Gate' );

    const measurementFolder = gui.addFolder( 'Measurement' );
    measurementFolder.add( measurement, 'measurementBasis', { 'Z': 0, 'X': 1, 'Y': 2 } );
    measurementFolder.add( measurement, 'outputA').listen().disable();
    measurementFolder.add( measurement, 'outputB').listen().disable();

    gui.open();

}