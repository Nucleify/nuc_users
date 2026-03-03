<template>
  <nuc-settings-card heading="Email Notifications">
    <div class="profile-form">
      <div class="profile-form-toggle-row">
        <div>
          <ad-label text="Account Updates" />
          <p class="profile-form-description">
            Receive emails about account activity and security
          </p>
        </div>
        <ad-checkbox v-model="notifications.accountUpdates" binary />
      </div>

      <div class="profile-form-toggle-row">
        <div>
          <ad-label text="Weekly Digest" />
          <p class="profile-form-description">
            Get a weekly summary of your activity
          </p>
        </div>
        <ad-checkbox v-model="notifications.weeklyDigest" binary />
      </div>
    </div>
  </nuc-settings-card>

  <hr class="settings-card-divider">

  <nuc-settings-card heading="Push Notifications">
    <div class="profile-form">
      <div class="profile-form-toggle-row">
        <div>
          <ad-label text="Enable Push Notifications" />
          <p class="profile-form-description">
            Receive real-time push notifications in your browser
          </p>
        </div>
        <ad-checkbox v-model="notifications.pushEnabled" binary />
      </div>
    </div>
  </nuc-settings-card>

  <hr class="settings-card-divider">

  <nuc-settings-card heading="Activity Alerts">
    <div class="profile-form">
      <div class="profile-form-toggle-row">
        <div>
          <ad-label text="Mentions" />
          <p class="profile-form-description">
            Notify when someone mentions you
          </p>
        </div>
        <ad-checkbox v-model="notifications.mentions" binary />
      </div>

      <div class="profile-form-toggle-row">
        <div>
          <ad-label text="Comments" />
          <p class="profile-form-description">
            Notify when someone comments on your content
          </p>
        </div>
        <ad-checkbox v-model="notifications.comments" binary />
      </div>

      <div class="profile-form-toggle-row">
        <div>
          <ad-label text="Updates" />
          <p class="profile-form-description">
            Notify about system updates and new features
          </p>
        </div>
        <ad-checkbox v-model="notifications.systemUpdates" binary />
      </div>
    </div>
  </nuc-settings-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const notifications = reactive({
  accountUpdates: true,
  weeklyDigest: false,
  pushEnabled: true,
  mentions: true,
  comments: true,
  systemUpdates: false,
})
</script>
