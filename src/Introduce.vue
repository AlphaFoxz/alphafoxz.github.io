<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Bodies, Composite, Engine, Render, Runner } from 'matter-js';

const matterRef = ref<HTMLDivElement>();
onMounted(() => {
  const engine = Engine.create();
  const render = Render.create({
    element: matterRef.value!,
    engine,
  });

  var boxA = Bodies.rectangle(400, 200, 80, 80);
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  // add all of the bodies to the world
  Composite.add(engine.world, [boxA, boxB, ground]);

  // run the renderer
  Render.run(render);

  // create runner
  var runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);
});
</script>

<template>
  <div ref="matterRef"></div>
</template>
