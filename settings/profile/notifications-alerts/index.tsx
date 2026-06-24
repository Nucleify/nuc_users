'use client'

import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdCheckbox, AdLabel, NucSettingsCard } from 'nucleify'

import './_index.scss'

type NotificationsState = {
  accountUpdates: boolean
  weeklyDigest: boolean
  pushEnabled: boolean
  mentions: boolean
  comments: boolean
  systemUpdates: boolean
}

export function NucUsersProfileNotificationsAlerts(): JSX.Element {
  const { t } = useTranslation()

  const [notifications, setNotifications] = useState<NotificationsState>({
    accountUpdates: true,
    weeklyDigest: false,
    pushEnabled: true,
    mentions: true,
    comments: true,
    systemUpdates: false,
  })

  return (
    <div>
      <NucSettingsCard heading={t('notifications-email-heading')}>
        <div className="profile-form">
          <div className="profile-form-toggle-row">
            <div>
              <AdLabel label={t('notifications-account-updates')} />
              <p className="profile-form-description">
                {t('notifications-account-updates-desc')}
              </p>
            </div>
            <AdCheckbox
              checked={notifications.accountUpdates}
              onChange={(event) =>
                setNotifications((prev) => ({
                  ...prev,
                  accountUpdates: Boolean(event.checked),
                }))
              }
            />
          </div>

          <div className="profile-form-toggle-row">
            <div>
              <AdLabel label={t('notifications-weekly-digest')} />
              <p className="profile-form-description">
                {t('notifications-weekly-digest-desc')}
              </p>
            </div>
            <AdCheckbox
              checked={notifications.weeklyDigest}
              onChange={(event) =>
                setNotifications((prev) => ({
                  ...prev,
                  weeklyDigest: Boolean(event.checked),
                }))
              }
            />
          </div>
        </div>
      </NucSettingsCard>

      <hr className="settings-card-divider" />

      <NucSettingsCard heading={t('notifications-push-heading')}>
        <div className="profile-form">
          <div className="profile-form-toggle-row">
            <div>
              <AdLabel label={t('notifications-push-enable')} />
              <p className="profile-form-description">
                {t('notifications-push-enable-desc')}
              </p>
            </div>
            <AdCheckbox
              checked={notifications.pushEnabled}
              onChange={(event) =>
                setNotifications((prev) => ({
                  ...prev,
                  pushEnabled: Boolean(event.checked),
                }))
              }
            />
          </div>
        </div>
      </NucSettingsCard>

      <hr className="settings-card-divider" />

      <NucSettingsCard heading={t('notifications-activity-heading')}>
        <div className="profile-form">
          <div className="profile-form-toggle-row">
            <div>
              <AdLabel label={t('notifications-mentions')} />
              <p className="profile-form-description">
                {t('notifications-mentions-desc')}
              </p>
            </div>
            <AdCheckbox
              checked={notifications.mentions}
              onChange={(event) =>
                setNotifications((prev) => ({
                  ...prev,
                  mentions: Boolean(event.checked),
                }))
              }
            />
          </div>

          <div className="profile-form-toggle-row">
            <div>
              <AdLabel label={t('notifications-comments')} />
              <p className="profile-form-description">
                {t('notifications-comments-desc')}
              </p>
            </div>
            <AdCheckbox
              checked={notifications.comments}
              onChange={(event) =>
                setNotifications((prev) => ({
                  ...prev,
                  comments: Boolean(event.checked),
                }))
              }
            />
          </div>

          <div className="profile-form-toggle-row">
            <div>
              <AdLabel label={t('notifications-updates')} />
              <p className="profile-form-description">
                {t('notifications-updates-desc')}
              </p>
            </div>
            <AdCheckbox
              checked={notifications.systemUpdates}
              onChange={(event) =>
                setNotifications((prev) => ({
                  ...prev,
                  systemUpdates: Boolean(event.checked),
                }))
              }
            />
          </div>
        </div>
      </NucSettingsCard>
    </div>
  )
}
