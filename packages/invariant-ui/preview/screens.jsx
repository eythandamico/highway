import { previewFeedback } from './feedback.js'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BottomNav } from '../components/bottom-nav.jsx'
import { WorkspaceSwitcher } from '../components/workspace-switcher.jsx'
import { ProfileMenu } from '../components/profile-menu.jsx'
import { SearchBar } from '../components/search-bar.jsx'
import { SearchToggle } from '../components/search-toggle.jsx'
import { TextInput } from '../components/text-input.jsx'
import { AgentAvatar } from '../components/agent-avatar.jsx'
import { ProfileAvatar, ProfileAvatarGroup } from '../components/profile-avatar.jsx'
import { SegmentedControl } from '../components/segmented-control.jsx'
import { ExpandCard } from '../components/expand-card.jsx'
import { StepIndicator } from '../components/step-indicator.jsx'
import { ActionButton } from '../components/action-button.jsx'
import { ToastProvider, useToast } from '../components/toast.jsx'
import { SpotlightCard } from '../components/spotlight-card.jsx'
import { PromptBar } from '../components/prompt-bar.jsx'
import { MessageBubble } from '../components/message-bubble.jsx'
import { Dropdown } from '../components/dropdown.jsx'
import { Select } from '../components/select.jsx'
import { Button } from '../components/button.jsx'
import { Toggle } from '../components/toggle.jsx'
import { Accordion } from '../components/accordion.jsx'
import { Badge } from '../components/badge.jsx'
import { IconButton } from '../components/icon-button.jsx'
import { PinInput } from '../components/pin-input.jsx'
import { NumberInput } from '../components/number-input.jsx'
import { Textarea } from '../components/textarea.jsx'
import { Checkbox } from '../components/checkbox.jsx'
import { RadioGroup } from '../components/radio-group.jsx'
import { SliderInput } from '../components/slider-input.jsx'
import { Card } from '../components/card.jsx'
import { BottomSheet } from '../components/bottom-sheet.jsx'
import { ImageCarousel } from '../components/image-carousel.jsx'
import { SplitPane } from '../components/split-pane.jsx'
import { Table } from '../components/table.jsx'
import { Alert } from '../components/alert.jsx'
import { Tabs } from '../components/tabs.jsx'
import { Progress } from '../components/progress.jsx'
import { Dialog } from '../components/dialog.jsx'
import { Modal } from '../components/modal.jsx'
import Icon from '../lib/icon.jsx'
import { TABS, CHAT_TABS, STARTUPS } from './data.jsx'


const PROFILE = { name: 'Alex Morgan', email: 'alex@example.com' }
const PROFILE_ITEMS = [
  { label: 'Settings', icon: 'settings', onAction: () => previewFeedback('Settings') },
  { label: 'Support', icon: 'message', onAction: () => previewFeedback('Support') },
  { label: 'Feedback', icon: 'mail', onAction: () => previewFeedback('Feedback') },
  { label: 'Log out', icon: 'logout', danger: true, onAction: () => previewFeedback('Logout') },
]

function ComponentStage({ children }) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}

const AVATAR_STATES = ['default', 'thinking', 'inactive']

export function useScreens(darkMode, toggleDarkMode) {
  const [avatarState, setAvatarState] = useState('default')
  const [tabDemo, setTabDemo] = useState('all')
  const [avatarRounded, setAvatarRounded] = useState('xl')
  const [selectedModel, setSelectedModel] = useState('sonnet')
  const [selectValue, setSelectValue] = useState(null)
  const [dropdownDir, setDropdownDir] = useState('bottom')
  const [dropdownAlign, setDropdownAlign] = useState('left')
  const isHorizontalDrop = dropdownDir === 'left' || dropdownDir === 'right'
  const [messageState, setMessageState] = useState('default')
  const [inputState, setInputState] = useState('default')
  const [inputIcon, setInputIcon] = useState(false)
  const [btnVariant, setBtnVariant] = useState('primary')
  const [btnSize, setBtnSize] = useState('default')
  const [btnIcon, setBtnIcon] = useState('none')
  const [btnLoading, setBtnLoading] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [avatarAlert, setAvatarAlert] = useState(false)
  const [avatarView, setAvatarView] = useState('single')
  const [toggleOn, setToggleOn] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [cardVariant, setCardVariant] = useState('gradient')
  const [carouselAutoHide, setCarouselAutoHide] = useState(false)
  const [carouselPos, setCarouselPos] = useState('bottom')
  const [segVariant, setSegVariant] = useState('subdued')
  const [profileDir, setProfileDir] = useState('bottom')
  const [profileAlign, setProfileAlign] = useState('right')
  const [pinValue, setPinValue] = useState('')
  const [numberValue, setNumberValue] = useState(5)
  const [textareaValue, setTextareaValue] = useState('')
  const [checkboxA, setCheckboxA] = useState(false)
  const [checkboxB, setCheckboxB] = useState(true)
  const [radioValue, setRadioValue] = useState('pro')
  const [sliderValue, setSliderValue] = useState(40)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeTabDemo, setActiveTabDemo] = useState('all')
  const [progressValue, setProgressValue] = useState(65)
  const [activeTab, setActiveTab] = useState('home')
  const [chatTab, setChatTab] = useState('home')
  const [currentSlug, setCurrentSlug] = useState('acme-ai-labs')
  const currentStartup = STARTUPS.find(s => s.slug === currentSlug)

  const addItems = [
    { label: 'New Objective', icon: 'bullseye-arrow', onAction: () => previewFeedback('New Objective') },
    { label: 'Upload File', icon: 'upload', onAction: () => previewFeedback('Upload File') },
    { label: 'Invite Agent', icon: 'robot', onAction: () => previewFeedback('Invite Agent') },
    { label: 'Post a Role', icon: 'target', onAction: () => previewFeedback('Post Role') },
  ]

  return [
    {
      group: 'Navigation', id: 'bottom-nav',
      label: 'BottomNav',
      render: () => (
        <>
          <style>{`nav[aria-label="Navigation"] { left: 50% !important; bottom: 50% !important; transform: translateX(-50%) translateY(50%) !important; }`}</style>
          <ComponentStage>
            <BottomNav
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              addItems={addItems}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              chatTabId="chat"
              onSendMessage={(msg) => previewFeedback('Send:', msg)}
            />
          </ComponentStage>
        </>
      ),
    },
    {
      id: 'profile',
      label: 'ProfileMenu',
      render: () => {
        const isHorizontal = profileDir === 'left' || profileDir === 'right'
        return (
          <>
            <ComponentStage>
              <ProfileMenu
                avatarUrl="/invariant-preview/avatar.svg"
                profile={PROFILE}
                profileItems={PROFILE_ITEMS}
                placement={`${profileDir}-${profileAlign}`}
              />
            </ComponentStage>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
              <SegmentedControl
                tabs={[
                  { id: 'top', icon: 'arrow-up' },
                  { id: 'bottom', icon: 'arrow-down' },
                  { id: 'left', icon: 'arrow-left' },
                  { id: 'right', icon: 'arrow-right' },
                ]}
                activeTab={profileDir}
                onTabChange={(id) => { setProfileDir(id); if (id === 'left' || id === 'right') setProfileAlign('center') }}
              />
              <SegmentedControl
                tabs={[
                  { id: 'left', icon: 'align-left' },
                  { id: 'center', icon: 'align-center' },
                  { id: 'right', icon: 'align-right' },
                ]}
                activeTab={isHorizontal ? 'center' : profileAlign}
                onTabChange={(id) => !isHorizontal && setProfileAlign(id)}
                className={isHorizontal ? 'opacity-40 cursor-not-allowed [&_*]:pointer-events-none' : ''}
              />
            </div>
          </>
        )
      },
    },
    {
      id: 'startup',
      label: 'WorkspaceSwitcher',
      render: () => (
        <ComponentStage>
          <WorkspaceSwitcher
            currentStartup={currentStartup}
            startups={STARTUPS}
            onStartupChange={setCurrentSlug}
          />
        </ComponentStage>
      ),
    },
    {
      id: 'chat-nav',
      label: 'ChatNav',
      render: () => (
        <>
          <style>{`nav[aria-label="Navigation"] { left: 50% !important; bottom: 50% !important; transform: translateX(-50%) translateY(50%) !important; }`}</style>
          <ComponentStage>
            <BottomNav
              tabs={CHAT_TABS}
              activeTab={chatTab}
              onTabChange={setChatTab}
              chatTabId="chat"
              onSendMessage={(msg) => previewFeedback('Send:', msg)}
            />
          </ComponentStage>
        </>
      ),
    },
    {
      group: 'Inputs', id: 'search',
      label: 'SearchBar',
      render: () => (
        <ComponentStage>
          <div className="flex flex-col items-center gap-8">
            <div className="w-[520px]">
              <SearchBar
                placeholder="Search anything..."
              />
            </div>
            <SearchToggle placeholder="Search anything..." />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'message-bubble',
      label: 'MessageBubble',
      render: () => (
        <>
          <ComponentStage>
            <div className="w-[500px] flex flex-col gap-4">
              <MessageBubble
                role="user"
                content="Can you help me deploy this to production?"
                avatarUrl="/invariant-preview/avatar.svg"
                timestamp="2:14 PM"
              />
              <MessageBubble
                role="agent"
                agentName="Nova"
                content="Sure! I'll run the build pipeline and set up the deployment. Give me a moment to check the configuration."
                timestamp="2:14 PM"
              />
              <MessageBubble
                role="user"
                content="Go for it."
                avatarUrl="/invariant-preview/avatar.svg"
                timestamp="2:15 PM"
              />
              <MessageBubble
                role="agent"
                agentName="Nova"
                content={messageState === 'thinking' ? undefined : "Done! Deployment is live at production.invariant.com"}
                thinking={messageState === 'thinking'}
                timestamp="2:15 PM"
              />
            </div>
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'default', label: 'Default' },
                { id: 'thinking', label: 'Thinking' },
              ]}
              activeTab={messageState}
              onTabChange={setMessageState}
            />
          </div>
        </>
      ),
    },
    {
      id: 'prompt-bar',
      label: 'PromptBar',
      render: () => (
        <ComponentStage>
          <div className="w-[600px]">
            <PromptBar
              placeholder="Ask anything..."
              models={[
                { id: 'sonnet', label: 'Sonnet 4' },
                { id: 'gpt4o', label: 'GPT-4o' },
                { id: 'gemini', label: 'Gemini 2.5 Pro' },
              ]}
              activeModel={selectedModel}
              onModelChange={setSelectedModel}
              onSubmit={(msg) => previewFeedback('Send:', msg)}
              onUpload={() => previewFeedback('Upload')}
              onMicPress={() => previewFeedback('Mic')}
            />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'select',
      label: 'Select',
      render: () => (
        <ComponentStage>
          <div className="w-[280px]">
            <Select
              label="Model"
              placeholder="Choose a model..."
              options={[
                { id: 'sonnet', label: 'Sonnet 4' },
                { id: 'opus', label: 'Opus 4' },
                { id: 'haiku', label: 'Haiku 4' },
                { id: 'gpt4o', label: 'GPT-4o' },
                { id: 'gemini', label: 'Gemini 2.5 Pro' },
              ]}
              value={selectValue}
              onChange={setSelectValue}
            />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'dropdown',
      label: 'Dropdown',
      render: () => (
        <>
          <ComponentStage>
            <Dropdown
              placement={`${dropdownDir}-${dropdownAlign}`}
              items={[
                { label: 'Edit', icon: 'edit', onAction: () => previewFeedback('Edit') },
                { label: 'Duplicate', icon: 'copy', onAction: () => previewFeedback('Duplicate') },
                { label: 'Share', icon: 'external-link', onAction: () => previewFeedback('Share') },
                { divider: true },
                { label: 'Delete', icon: 'close', danger: true, onAction: () => previewFeedback('Delete') },
              ]}
            />
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'top', icon: 'arrow-up' },
                { id: 'bottom', icon: 'arrow-down' },
                { id: 'left', icon: 'arrow-left' },
                { id: 'right', icon: 'arrow-right' },
              ]}
              activeTab={dropdownDir}
              onTabChange={(id) => { setDropdownDir(id); if (id === 'left' || id === 'right') setDropdownAlign('center') }}
            />
            <SegmentedControl
              tabs={[
                { id: 'left', icon: 'align-left' },
                { id: 'center', icon: 'align-center' },
                { id: 'right', icon: 'align-right' },
              ]}
              activeTab={isHorizontalDrop ? 'center' : dropdownAlign}
              onTabChange={(id) => !isHorizontalDrop && setDropdownAlign(id)}
              className={isHorizontalDrop ? 'opacity-40 cursor-not-allowed [&_*]:pointer-events-none' : ''}
            />
          </div>
        </>
      ),
    },
    {
      group: 'Actions', id: 'button',
      label: 'Button',
      render: () => (
        <>
          <ComponentStage>
            <Button
              label="Button"
              variant={btnVariant}
              size={btnSize}
              iconLeft={btnIcon === 'left' || btnIcon === 'both' ? 'plus' : undefined}
              iconRight={btnIcon === 'right' || btnIcon === 'both' ? 'arrow-right' : undefined}
              loading={btnLoading}
              disabled={btnDisabled}
            />
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'primary', label: 'Primary' },
                { id: 'secondary', label: 'Secondary' },
                { id: 'ghost', label: 'Ghost' },
                { id: 'danger', label: 'Danger' },
              ]}
              activeTab={btnVariant}
              onTabChange={setBtnVariant}
            />
            <SegmentedControl
              tabs={[
                { id: 'small', label: 'S' },
                { id: 'default', label: 'M' },
                { id: 'large', label: 'L' },
              ]}
              activeTab={btnSize}
              onTabChange={setBtnSize}
            />
            <SegmentedControl
              tabs={[
                { id: 'none', label: 'No Icon' },
                { id: 'left', icon: 'arrow-left' },
                { id: 'right', icon: 'arrow-right' },
                { id: 'both', label: 'Both' },
              ]}
              activeTab={btnIcon}
              onTabChange={setBtnIcon}
            />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--inv-surface)]" style={{ boxShadow: 'var(--inv-shadow-sm)' }}>
              <span className="text-[14px] text-[var(--inv-muted)]">Loading</span>
              <Toggle checked={btnLoading} onChange={setBtnLoading} size="small" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--inv-surface)]" style={{ boxShadow: 'var(--inv-shadow-sm)' }}>
              <span className="text-[14px] text-[var(--inv-muted)]">Disabled</span>
              <Toggle checked={btnDisabled} onChange={setBtnDisabled} size="small" />
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'icon-button',
      label: 'IconButton',
      render: () => (
        <ComponentStage>
          <div className="flex items-center gap-2">
            <IconButton icon="plus" label="Add" elevated />
            <IconButton icon="edit" label="Edit" elevated />
            <IconButton icon="upload" label="Upload" elevated />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <IconButton icon="close" label="Close" size="small" />
            <IconButton icon="settings" label="Settings" size="small" />
            <IconButton icon="search" label="Search" size="small" />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'text-input',
      label: 'TextInput',
      render: () => (
        <>
          <ComponentStage>
            <div className="w-[360px]">
              <TextInput
                label="Email"
                placeholder="you@example.com"
                disabled={inputState === 'disabled'}
                error={inputState === 'error' ? 'Invalid email address' : undefined}
                autoFocus={inputState === 'focus'}
                icon={inputIcon ? 'mail' : undefined}
                key={`${inputState}-${inputIcon}`}
              />
            </div>
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'default', label: 'Default' },
                { id: 'focus', label: 'Focus' },
                { id: 'error', label: 'Error' },
                { id: 'disabled', label: 'Disabled' },
              ]}
              activeTab={inputState}
              onTabChange={setInputState}
            />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--inv-surface)]" style={{ boxShadow: 'var(--inv-shadow-sm)' }}>
              <span className="text-[14px] text-[var(--inv-muted)]">Icon</span>
              <Toggle checked={inputIcon} onChange={setInputIcon} />
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'textarea',
      label: 'Textarea',
      render: () => (
        <ComponentStage>
          <div className="w-[360px]">
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              maxLength={280}
              rows={5}
            />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'number-input',
      label: 'NumberInput',
      render: () => (
        <ComponentStage>
          <NumberInput
            value={numberValue}
            onChange={setNumberValue}
            min={0}
            max={99}
          />
        </ComponentStage>
      ),
    },
    {
      id: 'pin-input',
      label: 'PinInput',
      render: () => (
        <ComponentStage>
          <PinInput value={pinValue} onChange={setPinValue} />
        </ComponentStage>
      ),
    },
    {
      id: 'checkbox',
      label: 'Checkbox',
      render: () => (
        <ComponentStage>
          <div className="flex flex-col gap-3">
            <Checkbox checked={checkboxA} onChange={setCheckboxA} label="I agree to the terms" />
            <Checkbox checked={checkboxB} onChange={setCheckboxB} label="Send me updates" />
            <Checkbox disabled label="Locked by policy" />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'radio-group',
      label: 'RadioGroup',
      render: () => (
        <ComponentStage>
          <RadioGroup
            options={[
              { id: 'free', label: 'Free' },
              { id: 'pro', label: 'Pro' },
              { id: 'team', label: 'Team' },
            ]}
            value={radioValue}
            onChange={setRadioValue}
          />
        </ComponentStage>
      ),
    },
    {
      id: 'slider-input',
      label: 'SliderInput',
      render: () => (
        <ComponentStage>
          <div className="w-[360px]">
            <SliderInput
              label="Volume"
              value={sliderValue}
              onChange={setSliderValue}
              min={0}
              max={100}
              suffix="%"
            />
          </div>
        </ComponentStage>
      ),
    },
    {
      group: 'Display', id: 'profile-avatar',
      label: 'ProfileAvatar',
      render: () => (
        <>
          <ComponentStage>
            {avatarView === 'single' ? (
              <ProfileAvatar name="Eythan D'Amico" avatarUrl="/invariant-preview/avatar.svg" size={40} rounded={avatarRounded} alert={avatarAlert} />
            ) : (
              <ProfileAvatarGroup
                size={40}
                rounded={avatarRounded}
                avatars={[
                  { name: 'Eythan', avatarUrl: '/invariant-preview/avatar.svg' },
                  { name: 'Sarah', avatarUrl: '/invariant-preview/avatar.svg' },
                  { name: 'James', avatarUrl: '/invariant-preview/avatar.svg' },
                  { name: 'Maria', avatarUrl: '/invariant-preview/avatar.svg' },
                  { name: 'Alex', avatarUrl: '/invariant-preview/avatar.svg' },
                ]}
              />
            )}
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'single', icon: 'user' },
                { id: 'group', icon: 'users' },
              ]}
              activeTab={avatarView}
              onTabChange={setAvatarView}
            />
            <SegmentedControl
              tabs={[
                { id: 'xl', icon: 'square' },
                { id: 'full', icon: 'circle' },
              ]}
              activeTab={avatarRounded}
              onTabChange={setAvatarRounded}
            />
            <SegmentedControl
              tabs={[
                { id: 'off', icon: 'notification' },
                { id: 'on', icon: 'bell-dot' },
              ]}
              activeTab={avatarAlert ? 'on' : 'off'}
              onTabChange={(id) => avatarView === 'single' && setAvatarAlert(id === 'on')}
              className={avatarView === 'group' ? 'opacity-40 cursor-not-allowed [&_*]:pointer-events-none' : ''}
            />
          </div>
        </>
      ),
    },
    {
      id: 'agent-avatar',
      label: 'AgentAvatar',
      render: () => (
        <>
          <ComponentStage>
            <div className="flex items-center gap-4">
              <AgentAvatar name="Max" size={80} state={avatarState} />
              <AgentAvatar name="Luna" size={80} state={avatarState} />
              <AgentAvatar name="Nova" size={80} state={avatarState} />
            </div>
          </ComponentStage>

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={AVATAR_STATES.map(s => ({ id: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              activeTab={avatarState}
              onTabChange={setAvatarState}
            />
          </div>
        </>
      ),
    },
    {
      group: 'Controls', id: 'segmented-tabs',
      label: 'SegmentedControl',
      render: () => (
        <>
          <ComponentStage>
            <SegmentedControl
              tabs={[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'archived', label: 'Archived' },
              ]}
              activeTab={tabDemo}
              onTabChange={setTabDemo}
              variant={segVariant}
            />
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'default', label: 'Default' },
                { id: 'subdued', label: 'Subdued' },
              ]}
              activeTab={segVariant}
              onTabChange={setSegVariant}
            />
          </div>
        </>
      ),
    },
    {
      group: 'Layout', id: 'morph-card',
      label: 'ExpandCard',
      render: () => (
        <ComponentStage>
          <div className="w-[400px] flex flex-col gap-3">
            <ExpandCard title="Getting started" icon="home">
              Everything you need to set up your project and start building. Follow the quick start guide to get running in minutes.
            </ExpandCard>
            <ExpandCard title="Configuration" icon="settings">
              Customize your setup with flexible options. Adjust settings to match your workflow and preferences.
            </ExpandCard>
            <ExpandCard title="Resources" icon="folder">
              Guides, examples, and references to help you get the most out of your tools.
            </ExpandCard>
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'step-indicator',
      label: 'StepIndicator',
      render: () => (
        <>
          <ComponentStage>
            <StepIndicator steps={5} activeStep={activeStep} onStepChange={setActiveStep} />
          </ComponentStage>

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveStep(s => Math.max(0, s - 1))}
              className="px-3 py-1.5 text-[14px] font-medium rounded-xl bg-[var(--inv-surface)] text-[var(--inv-muted)] hover:text-[var(--inv-heading)] transition-colors duration-150 cursor-pointer"
              style={{ boxShadow: 'var(--inv-shadow-sm)' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(s => Math.min(4, s + 1))}
              className="px-3 py-1.5 text-[14px] font-medium rounded-xl bg-[var(--inv-accent)] text-[var(--inv-bg)] transition-colors duration-150 cursor-pointer"
            >
              Next
            </button>
          </div>
        </>
      ),
    },
    {
      id: 'morph-button',
      label: 'ActionButton',
      render: () => (
        <ComponentStage>
          <ActionButton label="Save" icon="check" />
        </ComponentStage>
      ),
    },
    {
      id: 'split-pane',
      label: 'SplitPane',
      render: () => (
        <ComponentStage>
          <SplitPane
            height={360}
            className="w-[560px]"
            left={
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-[var(--inv-text-lg)] font-semibold text-[var(--inv-heading)] mb-1">Editor</div>
                  <div className="text-[var(--inv-text-sm)] text-[var(--inv-muted)]">Drag the divider</div>
                </div>
              </div>
            }
            right={
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-[var(--inv-text-lg)] font-semibold text-[var(--inv-heading)] mb-1">Preview</div>
                  <div className="text-[var(--inv-text-sm)] text-[var(--inv-muted)]">Resizable panes</div>
                </div>
              </div>
            }
          />
        </ComponentStage>
      ),
    },
    {
      id: 'image-carousel',
      label: 'ImageCarousel',
      render: () => (
        <>
          <ComponentStage>
            <div className="w-[480px]">
              <ImageCarousel
                images={[
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
                  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=500&fit=crop',
                  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=500&fit=crop',
                  'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&h=500&fit=crop',
                ]}
                height={300}
                autoHide={carouselAutoHide}
                controlsPosition={carouselPos}
              />
            </div>
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'top', icon: 'arrow-up' },
                { id: 'bottom', icon: 'arrow-down' },
                { id: 'left', icon: 'arrow-left' },
                { id: 'right', icon: 'arrow-right' },
              ]}
              activeTab={carouselPos}
              onTabChange={setCarouselPos}
            />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--inv-surface)]" style={{ boxShadow: 'var(--inv-shadow-sm)' }}>
              <span className="text-[14px] text-[var(--inv-muted)]">Auto-hide</span>
              <Toggle checked={carouselAutoHide} onChange={setCarouselAutoHide} size="small" />
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'card',
      label: 'Card',
      render: () => (
        <>
          <ComponentStage>
            <Card
              variant={cardVariant}
              gradientSeed={cardVariant === 'gradient' ? 'Project Alpha' : undefined}
              image={cardVariant === 'video' ? '/card-video.mp4' : undefined}
              title="Project Alpha"
              description="A next-generation interface for managing autonomous agent workflows."
              className="w-[340px]"
            />
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <SegmentedControl
              tabs={[
                { id: 'gradient', label: 'Gradient' },
                { id: 'subdued', label: 'Subdued' },
                { id: 'video', label: 'Video' },
              ]}
              activeTab={cardVariant}
              onTabChange={setCardVariant}
            />
          </div>
        </>
      ),
    },
    {
      id: 'spotlight-card',
      label: 'SpotlightCard',
      render: () => (
        <ComponentStage>
          <SpotlightCard className="w-[280px]">
            <div className="p-5">
              <div className="text-[15px] font-medium text-[var(--inv-heading)] mb-1">Analytics</div>
              <div className="text-[14px] text-[var(--inv-muted)]">Track performance metrics and user engagement in real time.</div>
            </div>
          </SpotlightCard>
        </ComponentStage>
      ),
    },
    {
      id: 'toggle',
      label: 'Toggle',
      render: () => (
        <ComponentStage>
          <div className="flex items-center gap-4">
            <Toggle checked={toggleOn} onChange={setToggleOn} />
            <Toggle checked={toggleOn} onChange={setToggleOn} size="small" />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'badge',
      label: 'Badge',
      render: () => (
        <ComponentStage>
          <div className="flex items-center gap-2">
            <Badge label="Active" variant="dark" />
            <Badge label="Pending" variant="subdued" />
            <Badge label="v2.1.0" variant="outline" />
          </div>
        </ComponentStage>
      ),
    },
    {
      id: 'accordion',
      label: 'Accordion',
      render: () => (
        <ComponentStage>
          <div className="w-[340px]">
            <Accordion items={[
              { title: 'What is this?', content: 'A component library for building agent-powered interfaces with copy-paste components and CSS variable theming.' },
              { title: 'How do I install it?', content: 'Clone the repo, copy the components you need, install lucide-react, and import the theme CSS.' },
              { title: 'Can I customize it?', content: 'Override any --inv-* CSS variable to change colors, shadows, radii, and typography across all components.' },
            ]} />
          </div>
        </ComponentStage>
      ),
    },
    {
      group: 'Feedback', id: 'toast',
      label: 'Toast',
      render: () => <ToastDemo />,
    },
    {
      id: 'dialog',
      label: 'Dialog',
      render: () => (
        <>
          <ComponentStage>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="px-4 py-2.5 text-[15px] font-medium rounded-xl bg-[var(--inv-heading)] text-[var(--inv-bg)] cursor-pointer transition-[scale] duration-200 ease-out active:scale-[0.96]"
            >
              Open Dialog
            </button>
          </ComponentStage>
          {createPortal(
            <Dialog
              isOpen={dialogOpen}
              onClose={() => setDialogOpen(false)}
              title="Delete project?"
              description="This action cannot be undone. All data will be permanently removed."
              actions={
                <>
                  <Button label="Cancel" variant="ghost" onClick={() => setDialogOpen(false)} />
                  <Button label="Delete" variant="danger" onClick={() => setDialogOpen(false)} />
                </>
              }
            />,
            document.body
          )}
        </>
      ),
    },
    {
      id: 'modal',
      label: 'Modal',
      render: () => (
        <>
          <ComponentStage>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 text-[15px] font-medium rounded-xl bg-[var(--inv-heading)] text-[var(--inv-bg)] cursor-pointer transition-[scale] duration-200 ease-out active:scale-[0.96]"
            >
              Open Modal
            </button>
          </ComponentStage>
          {createPortal(
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Settings"
            >
              <div className="flex flex-col gap-4">
                <TextInput label="Display name" placeholder="Your name" />
                <TextInput label="Email" placeholder="you@example.com" />
                <div className="flex justify-end gap-2 pt-2">
                  <Button label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
                  <Button label="Save" variant="primary" onClick={() => setModalOpen(false)} />
                </div>
              </div>
            </Modal>,
            document.body
          )}
        </>
      ),
    },
    {
      group: 'Data', id: 'table',
      label: 'Table',
      render: () => (
        <ComponentStage>
          <Table
            className="w-[600px]"
            columns={[
              { key: 'agent', label: 'Agent' },
              { key: 'status', label: 'Status' },
              { key: 'tasks', label: 'Tasks', align: 'right' },
              { key: 'uptime', label: 'Uptime', align: 'right' },
            ]}
            data={[
              { agent: 'Scout', status: 'Active', tasks: 142, uptime: '99.8%' },
              { agent: 'Forge', status: 'Active', tasks: 89, uptime: '99.2%' },
              { agent: 'Relay', status: 'Idle', tasks: 67, uptime: '98.5%' },
              { agent: 'Cipher', status: 'Active', tasks: 203, uptime: '99.9%' },
              { agent: 'Beacon', status: 'Paused', tasks: 31, uptime: '97.1%' },
              { agent: 'Nova', status: 'Active', tasks: 118, uptime: '99.4%' },
            ]}
          />
        </ComponentStage>
      ),
    },
    {
      id: 'tabs',
      label: 'Tabs',
      render: () => (
        <ComponentStage>
          <Tabs
            tabs={[
              { id: 'all', label: 'All', count: 24 },
              { id: 'active', label: 'Active', count: 12 },
              { id: 'archived', label: 'Archived', count: 3 },
            ]}
            activeTab={activeTabDemo}
            onTabChange={setActiveTabDemo}
          />
        </ComponentStage>
      ),
    },
    {
      id: 'progress',
      label: 'Progress',
      render: () => (
        <>
          <ComponentStage>
            <div className="w-[360px] flex flex-col gap-6">
              <Progress value={progressValue} label="Upload" showValue />
              <Progress value={progressValue} size="small" />
              <Progress value={100} label="Complete" size="large" />
            </div>
          </ComponentStage>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
            <div className="w-[200px]">
              <SliderInput
                label="Value"
                value={progressValue}
                onChange={setProgressValue}
                min={0}
                max={100}
                suffix="%"
              />
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'alert',
      label: 'Alert',
      render: () => (
        <ComponentStage>
          <div className="w-[420px] flex flex-col gap-3">
            <Alert variant="info" title="New update available" description="Version 2.1 includes performance improvements and bug fixes." dismissible />
            <Alert variant="success" title="Deployment complete" description="Your changes are now live." />
            <Alert variant="warning" title="Rate limit" description="You're approaching your API quota." />
            <Alert variant="error" title="Build failed" description="Check the logs for details." dismissible />
          </div>
        </ComponentStage>
      ),
    },
    {
      group: 'Overlays', id: 'bottom-sheet',
      label: 'BottomSheet',
      render: () => {
        return (
          <>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="px-4 py-2.5 text-[15px] font-medium rounded-xl bg-[var(--inv-heading)] text-[var(--inv-bg)] cursor-pointer transition-[scale] duration-200 ease-out active:scale-[0.96]"
            >
              Open Bottom Sheet
            </button>
            {createPortal(
              <BottomSheet
                isOpen={sheetOpen}
                onClose={() => setSheetOpen(false)}
              />,
              document.body
            )}
          </>
        )
      },
    },
  ]
}


function ToastDemo() {
  const { addToast } = useToast()
  return (
    <ComponentStage>
      <button
        type="button"
        onClick={() => addToast('Bread alert', { message: 'Something just popped up' })}
        className="px-4 py-2.5 text-[15px] font-medium rounded-xl bg-[var(--inv-heading)] text-[var(--inv-bg)] cursor-pointer transition-[scale] duration-200 ease-out active:scale-[0.96]"
      >
        Show Toast
      </button>
    </ComponentStage>
  )
}

