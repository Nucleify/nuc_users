<template>
  <nuc-settings-card :heading="t('notifications-email-heading')">
    <div class="profile-form">
      <div class="profile-form-toggle-row">
        <div>
          <ad-label :text="t('notifications-account-updates')" />
          <p class="profile-form-description">
            {{ t('notifications-account-updates-desc') }}
          </p>
        </div>
        <ad-checkbox v-model="notifications.accountUpdates" binary />
      </div>

      <div class="profile-form-toggle-row">
        <div>
          <ad-label :text="t('notifications-weekly-digest')" />
          <p class="profile-form-description">
            {{ t('notifications-weekly-digest-desc') }}
          </p>
        </div>
        <ad-checkbox v-model="notifications.weeklyDigest" binary />
      </div>
    </div>
  </nuc-settings-card>

  <hr class="settings-card-divider">

  <nuc-settings-card :heading="t('notifications-push-heading')">
    <div class="profile-form">
      <div class="profile-form-toggle-row">
        <div>
          <ad-label :text="t('notifications-push-enable')" />
          <p class="profile-form-description">
            {{ t('notifications-push-enable-desc') }}
          </p>
        </div>
        <ad-checkbox v-model="notifications.pushEnabled" binary />
      </div>
    </div>
  </nuc-settings-card>

  <hr class="settings-card-divider">

  <nuc-settings-card :heading="t('notifications-activity-heading')">
    <div class="profile-form">
      <div class="profile-form-toggle-row">
        <div>
          <ad-label :text="t('notifications-mentions')" />
          <p class="profile-form-description">
            {{ t('notifications-mentions-desc') }}
          </p>
        </div>
        <ad-checkbox v-model="notifications.mentions" binary />
      </div>

      <div class="profile-form-toggle-row">
        <div>
          <ad-label :text="t('notifications-comments')" />
          <p class="profile-form-description">
            {{ t('notifications-comments-desc') }}
          </p>
        </div>
        <ad-checkbox v-model="notifications.comments" binary />
      </div>

      <div class="profile-form-toggle-row">
        <div>
          <ad-label :text="t('notifications-updates')" />
          <p class="profile-form-description">
            {{ t('notifications-updates-desc') }}
          </p>
        </div>
        <ad-checkbox v-model="notifications.systemUpdates" binary />
      </div>
    </div>
  </nuc-settings-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const notifications = reactive({
  accountUpdates: true,
  weeklyDigest: false,
  pushEnabled: true,
  mentions: true,
  comments: true,
  systemUpdates: false,
})
</script>

<style lang="scss">
@import 'index';
</style>
