import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useFrame, useCleanup, usePhysics, useApp, useLocalPlayer} = metaversefile;

export default () => {
  const app = useApp();
  const physics = usePhysics();

  const geometry = new THREE.PlaneGeometry( 5, 5 );
  geometry.rotateY(Math.PI / 2); // note: match with physx' default plane rotation.
  const material = new THREE.MeshStandardMaterial( {color: 'gray'} );
  const physicsPlane = new THREE.Mesh( geometry, material );
  app.add( physicsPlane );

  const dynamic = false;
  const physicsObject = physics.addPlaneGeometry(app.position, app.quaternion, dynamic);
  const result = physics.setTrigger(physicsObject.physicsId);

  const localPlayer = useLocalPlayer();
  app.addEventListener('triggerin', event => {
    console.log('repo: triggerin: ', event.oppositePhysicsId);
    if (localPlayer.characterController && event.oppositePhysicsId === localPlayer.characterController.physicsId) {
      physicsPlane.material.color.set('cyan');
    }
  });
  app.addEventListener('triggerout', event => {
    console.log('repo: triggerout: ', event.oppositePhysicsId);
    if (localPlayer.characterController && event.oppositePhysicsId === localPlayer.characterController.physicsId) {
      physicsPlane.material.color.set('gray');
    }
  });

  useFrame(({timestamp}) => {
    if (dynamic) {
      physicsPlane.position.copy(physicsObject.position).sub(app.position);
      physicsPlane.quaternion.copy(physicsObject.quaternion);
      physicsPlane.updateMatrixWorld();
    }
  });
  
  useCleanup(() => {
    physics.removeGeometry(physicsObject);
  });
  
  return app;
};

/* console_test
  metaversefileApi.getPairByPhysicsId(1)

  rootScene.traverse(child=>{
    if(child.contentId?.includes('physicsplane')) {
  console.log(child)
  window.physicsplaneApp=child
    }
  })

  physicsplane.children[0].visible=false

  metaversefileApi.getPairByPhysicsId(1)[1] === physicsplane
  false

  metaversefileApi.getPairByPhysicsId(1)[1] === physicsplane.physicsObjects[0]
  true

  physicsplane.physicsObjects[0].physicsMesh === physicsplane.children[0]
  false

  metaversefileApi.getPairByPhysicsId(1)[0] === physicsplane
  true

  physicsManager.getScene().setVelocity(physicsplaneApp.physicsObjects[0],new THREE.Vector3(0,15,0),true)
  physicsManager.getScene().setAngularVelocity(physicsplaneApp.physicsObjects[0],new THREE.Vector3(1,2,3),true)
*/