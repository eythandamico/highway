# Composition Patterns

Full-page examples showing how to combine Invariant UI components.

---

## Settings Page

```jsx
<PageSection width="md">
  <Stack gap="xl">
    <Stack gap="xs">
      <h1 className="text-[var(--inv-text-xl)] font-semibold text-[var(--inv-heading)]">Settings</h1>
      <p className="text-[var(--inv-text-sm)] text-[var(--inv-muted)]">Manage your account</p>
    </Stack>

    <Surface padding="md" elevation="sm">
      <Stack gap="lg">
        <Stack gap="md">
          <h2 className="text-[var(--inv-text-base)] font-semibold text-[var(--inv-heading)]">Profile</h2>
          <TextInput label="Display name" placeholder="Your name" />
          <TextInput label="Email" placeholder="you@example.com" />
        </Stack>
        <Divider />
        <Row justify="end" gap="sm">
          <Button label="Cancel" variant="ghost" />
          <Button label="Save" variant="primary" />
        </Row>
      </Stack>
    </Surface>

    <Surface padding="md" elevation="sm">
      <Stack gap="md">
        <h2 className="text-[var(--inv-text-base)] font-semibold text-[var(--inv-heading)]">Preferences</h2>
        <Row justify="between">
          <span className="text-[var(--inv-text-base)] text-[var(--inv-body)]">Dark mode</span>
          <Toggle checked={darkMode} onChange={setDarkMode} />
        </Row>
        <Row justify="between">
          <span className="text-[var(--inv-text-base)] text-[var(--inv-body)]">Notifications</span>
          <Toggle checked={notifications} onChange={setNotifications} />
        </Row>
      </Stack>
    </Surface>
  </Stack>
</PageSection>
```

---

## Chat Interface

```jsx
<div className="flex flex-col h-screen bg-[var(--inv-bg)]">
  <Stack gap="md" className="flex-1 overflow-y-auto px-4 py-6">
    <PageSection width="md">
      <Stack gap="lg">
        <MessageBubble role="user" content="..." avatarUrl="..." />
        <MessageBubble role="agent" agentName="Nova" content="..." />
      </Stack>
    </PageSection>
  </Stack>

  <div className="border-t border-[var(--inv-border)] p-4">
    <PageSection width="md">
      <PromptBar
        models={models}
        activeModel={activeModel}
        onModelChange={setActiveModel}
        onSubmit={handleSend}
      />
    </PageSection>
  </div>
</div>
```

---

## Dashboard Cards

```jsx
<PageSection width="lg">
  <Stack gap="lg">
    <Row justify="between">
      <h1 className="text-[var(--inv-text-xl)] font-semibold text-[var(--inv-heading)]">Dashboard</h1>
      <Row gap="sm">
        <SearchToggle placeholder="Search..." />
        <Dropdown items={menuItems} />
      </Row>
    </Row>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SpotlightCard>
        <Surface padding="md" elevation="none">
          <Stack gap="sm">
            <span className="text-[var(--inv-text-sm)] text-[var(--inv-muted)]">Active Agents</span>
            <span className="text-[var(--inv-text-xl)] font-semibold text-[var(--inv-heading)]">12</span>
          </Stack>
        </Surface>
      </SpotlightCard>
    </div>
  </Stack>
</PageSection>
```

---

## List/Detail View

```jsx
<div className="flex h-screen bg-[var(--inv-bg)]">
  {/* Sidebar list */}
  <div className="w-72 border-r border-[var(--inv-border)] overflow-y-auto">
    <div className="p-3">
      <SearchBar placeholder="Filter..." />
    </div>
    <Stack gap="xs" className="px-2 pb-4">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setSelected(item.id)}
          className="w-full text-left px-3 py-2.5 rounded-xl transition-[background-color] duration-150 hover:bg-[var(--inv-nav-hover-bg)]"
        >
          <span className="text-[var(--inv-text-base)] text-[var(--inv-heading)]">{item.name}</span>
          <span className="text-[var(--inv-text-sm)] text-[var(--inv-muted)]">{item.subtitle}</span>
        </button>
      ))}
    </Stack>
  </div>

  {/* Detail pane */}
  <div className="flex-1 overflow-y-auto">
    <PageSection width="md" className="py-8">
      <Stack gap="lg">
        {/* detail content using Surface, Stack, etc. */}
      </Stack>
    </PageSection>
  </div>
</div>
```
