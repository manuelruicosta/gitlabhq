<script>
import { GlNewDropdown, GlNewDropdownItem } from '@gitlab/ui';
import { s__ } from '~/locale';

const dropdownOptions = [
  {
    value: false,
    text: s__('Integrations|Use default settings'),
  },
  {
    value: true,
    text: s__('Integrations|Use custom settings'),
  },
];

export default {
  dropdownOptions,
  name: 'OverrideDropdown',
  components: {
    GlNewDropdown,
    GlNewDropdownItem,
  },
  props: {
    inheritFromId: {
      type: Number,
      required: true,
    },
    override: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      selected: dropdownOptions.find(x => x.value === this.override),
    };
  },
  methods: {
    onClick(option) {
      this.selected = option;
      this.$emit('change', option.value);
    },
  },
};
</script>

<template>
  <div
    class="gl-display-flex gl-justify-content-space-between gl-align-items-baseline gl-py-4 gl-mt-5 gl-mb-6 gl-border-t-1 gl-border-t-solid gl-border-b-1 gl-border-b-solid gl-border-gray-100"
  >
    <span>{{ s__('Integrations|Default settings are inherited from the instance level.') }}</span>
    <input name="service[inherit_from_id]" :value="override ? '' : inheritFromId" type="hidden" />
    <gl-new-dropdown :text="selected.text">
      <gl-new-dropdown-item
        v-for="option in $options.dropdownOptions"
        :key="option.value"
        @click="onClick(option)"
      >
        {{ option.text }}
      </gl-new-dropdown-item>
    </gl-new-dropdown>
  </div>
</template>
