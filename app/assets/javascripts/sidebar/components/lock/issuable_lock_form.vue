<script>
import { mapGetters } from 'vuex';
import { __ } from '~/locale';
import tooltip from '~/vue_shared/directives/tooltip';
import Icon from '~/vue_shared/components/icon.vue';
import eventHub from '~/sidebar/event_hub';
import editForm from './edit_form.vue';

export default {
  issue: 'issue',
  locked: {
    icon: 'lock',
    class: 'value',
    iconClass: 'is-active',
    displayText: __('Locked'),
  },
  unlocked: {
    class: ['no-value hide-collapsed'],
    icon: 'lock-open',
    iconClass: '',
    displayText: __('Unlocked'),
  },
  components: {
    editForm,
    Icon,
  },

  directives: {
    tooltip,
  },

  props: {
    isEditable: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      isLockDialogOpen: false,
    };
  },
  computed: {
    ...mapGetters(['getNoteableData']),
    issuableDisplayName() {
      const isInIssuePage = this.getNoteableData.targetType === this.$options.issue;
      return isInIssuePage ? __('issue') : __('merge request');
    },
    isLocked() {
      return this.getNoteableData.discussion_locked;
    },
    lockStatus() {
      return this.isLocked ? this.$options.locked : this.$options.unlocked;
    },

    tooltipLabel() {
      return this.isLocked ? __('Locked') : __('Unlocked');
    },
  },

  created() {
    eventHub.$on('closeLockForm', this.toggleForm);
  },

  beforeDestroy() {
    eventHub.$off('closeLockForm', this.toggleForm);
  },

  methods: {
    toggleForm() {
      if (this.isEditable) {
        this.isLockDialogOpen = !this.isLockDialogOpen;
      }
    },
  },
};
</script>

<template>
  <div class="block issuable-sidebar-item lock">
    <div
      v-tooltip
      :title="tooltipLabel"
      class="sidebar-collapsed-icon"
      data-testid="sidebar-collapse-icon"
      data-container="body"
      data-placement="left"
      data-boundary="viewport"
      @click="toggleForm"
    >
      <icon :name="lockStatus.icon" class="sidebar-item-icon is-active" />
    </div>

    <div class="title hide-collapsed">
      {{ sprintf(__('Lock %{issuableDisplayName}'), { issuableDisplayName: issuableDisplayName }) }}
      <a
        v-if="isEditable"
        class="float-right lock-edit"
        href="#"
        data-testid="edit-link"
        data-track-event="click_edit_button"
        data-track-label="right_sidebar"
        data-track-property="lock_issue"
        @click.prevent="toggleForm"
      >
        {{ __('Edit') }}
      </a>
    </div>

    <div class="value sidebar-item-value hide-collapsed">
      <edit-form
        v-if="isLockDialogOpen"
        data-testid="edit-form"
        :is-locked="isLocked"
        :issuable-display-name="issuableDisplayName"
      />

      <div data-testid="lock-status" class="sidebar-item-value" :class="lockStatus.class">
        <icon
          :size="16"
          :name="lockStatus.icon"
          class="sidebar-item-icon"
          :class="lockStatus.iconClass"
        />
        {{ lockStatus.displayText }}
      </div>
    </div>
  </div>
</template>
