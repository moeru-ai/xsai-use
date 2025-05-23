<template>
  <div>
    <h1>XSai Vue Example</h1>
    <XSaiButton>Click Me</XSaiButton>
  </div>
</template>

<script>
import { createXSaiComponent } from 'xsai';

const XSaiButton = createXSaiComponent('button');

export default {
  components: {
    XSaiButton
  }
};
</script>
