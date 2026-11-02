import type { ReactNode, ComponentProps } from 'react';

export interface NumberInputProps {
  label?: ReactNode; value?: number; onChange?: (value: number) => void;
  min?: number; max?: number; step?: number; disabled?: boolean; error?: ReactNode; className?: string;
}
export interface SliderInputProps extends Omit<NumberInputProps, 'error'> { suffix?: string }
export interface SelectProps {
  label?: ReactNode; options?: { id: string; label: ReactNode; disabled?: boolean; textValue?: string }[];
  value?: string; onChange?: (value: string) => void; placeholder?: string; className?: string; disabled?: boolean; name?: string; required?: boolean;
}
export interface BottomSheetProps {
  isOpen: boolean; onClose?: () => void; title?: string; children?: ReactNode; className?: string;
  /** Optional caller-owned sibling to animate. Never inferred from the document. */
  pageTarget?: HTMLElement | null;
}
export type MenuPlacement = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right' | 'left-top' | 'left-center' | 'left-bottom' | 'right-top' | 'right-center' | 'right-bottom';
export interface MenuAction { label?: ReactNode; icon?: string; onAction?: () => void; danger?: boolean; disabled?: boolean; divider?: boolean }
export interface DropdownProps { trigger?: ReactNode; items?: MenuAction[]; placement?: MenuPlacement; className?: string }
export interface ProfileMenuProps { avatarUrl?: string; profile?: { name: string; email: string }; profileItems?: MenuAction[]; placement?: MenuPlacement }
export interface WorkspaceOption { slug: string; name: string; avatarUrl?: string; color?: string; initials?: string }
export interface WorkspaceSwitcherProps { currentStartup?: WorkspaceOption; startups?: WorkspaceOption[]; onStartupChange?: (slug: string) => void }
export interface SplitPaneProps { left?: ReactNode; right?: ReactNode; direction?: 'horizontal' | 'vertical'; defaultSplit?: number; minSize?: number; height?: string | number; className?: string }
export interface TabsProps { tabs?: { id: string; label: ReactNode; count?: number }[]; activeTab?: string; onTabChange?: (id: string) => void; className?: string }
export interface ProgressProps { value?: number; max?: number; label?: ReactNode; showValue?: boolean; size?: 'small' | 'default' | 'large'; animated?: boolean; className?: string }

export interface ExpandCardProps { title: ReactNode; children?: ReactNode; icon?: string; defaultExpanded?: boolean; className?: string }
export interface AccordionProps { items?: { title: ReactNode; content: ReactNode }[]; multiple?: boolean; className?: string }
export interface SegmentedControlProps { tabs?: { id: string; label?: string; icon?: string; disabled?: boolean }[]; label?: string; disabled?: boolean; activeTab?: string; onTabChange?: (id: string) => void; variant?: 'default' | 'subdued'; className?: string }
export interface InvariantRadioGroupProps { options?: { id: string; label: ReactNode; disabled?: boolean }[]; value?: string; onChange?: (value: string) => void; label?: ReactNode; direction?: 'vertical' | 'horizontal'; disabled?: boolean; className?: string; 'aria-labelledby'?: string }
export interface ProfileAvatarProps { name: string; avatarUrl?: string; size?: number; rounded?: 'xl' | 'full'; alert?: boolean; grouped?: boolean; onClick?: () => void }
export interface ProfileAvatarGroupProps { avatars?: ProfileAvatarProps[]; max?: number; size?: number; rounded?: 'xl' | 'full'; className?: string }
export interface ImageCarouselProps { images?: (string | { src: string; alt?: string })[]; height?: number; autoHide?: boolean; controlsPosition?: 'top' | 'bottom' | 'left' | 'right'; className?: string }
export interface BottomNavProps { tabs?: { id: string; label?: string; icon?: string }[]; activeTab?: string; onTabChange?: (id: string) => void; addItems?: MenuAction[]; notifications?: Record<string, number>; avatarUrl?: string; profile?: { name: string; email?: string }; profileItems?: MenuAction[]; chatTabId?: string; onSendMessage?: (message: string) => void; darkMode?: boolean; onToggleDarkMode?: () => void }
export interface TableProps<T extends Record<string, unknown> = Record<string, ReactNode>> {
  columns?: { key: keyof T & string; label: ReactNode; align?: 'left' | 'right'; sortable?: boolean; /** Move this value beside the first column below this container width (px). */ collapseBelow?: number; render?: (value: T[keyof T], row: T, context: { width: number; collapsed: boolean }) => ReactNode }[];
  data?: T[]; footer?: ReactNode[]; caption?: ReactNode; selectable?: boolean; onSelectionChange?: (indices: number[]) => void; className?: string;
  rowKey?: keyof T & string | ((row: T) => string | number);
  selectedKeys?: (string | number)[]; defaultSelectedKeys?: (string | number)[]; onSelectedKeysChange?: (keys: (string | number)[]) => void;
  sort?: { key: keyof T & string; direction: 'asc' | 'desc' } | null; onSortChange?: (sort: { key: keyof T & string; direction: 'asc' | 'desc' }) => void;
}
export interface PromptBarProps { placeholder?: string; models?: { id: string; label: string; icon?: string; description?: string }[]; activeModel?: string; onModelChange?: (id: string) => void; onSubmit?: (value: string) => void; onUpload?: () => void; onMicPress?: () => void; className?: string }

export interface ActionButtonProps extends Omit<ComponentProps<'button'>, 'onClick' | 'children'> {
  size?: 'xs' | 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link';
  label?: string; icon?: string; onAction?: () => void | Promise<void>; onActionError?: (error: unknown) => void;
  pendingLabel?: string; successLabel?: string; errorLabel?: string; resetAfterMs?: number;
  /** @deprecated Retained for compatibility; completion follows onAction, never a timer. */ loadingDuration?: number;
}

export interface ToastOptions { message?: string; icon?: string; duration?: number; action?: ReactNode; variant?: 'info' | 'success' | 'warning' | 'error' | 'loading' }
export interface ToastUpdate extends ToastOptions { title?: string }
export interface ToastPromiseOptions<T = unknown> extends ToastOptions { loading?: string; success?: string | ((value: T) => string); error?: string | ((reason: unknown) => string) }

export interface ToastController { addToast: (title: string, options?: ToastOptions) => number; dismissToast: (id: number) => void; updateToast: (id: number, options: ToastUpdate) => void; promiseToast: <T>(promise: Promise<T>, options?: ToastPromiseOptions<T>) => number }

export interface CardProps { image?: string; title?: ReactNode; description?: ReactNode; children?: ReactNode; variant?: 'default' | 'subdued' | 'gradient' | 'video'; gradientSeed?: string; className?: string }
export interface MenuItemProps { label: ReactNode; icon?: string; danger?: boolean; description?: ReactNode; selected?: boolean; disabled?: boolean; onClick?: ComponentProps<'button'>['onClick']; className?: string }

export interface SearchBarProps { value?: string; inputRef?: import("react").Ref<HTMLInputElement>; "aria-label"?: string; placeholder?: string; shortcutKey?: string; className?: string; onSearch?: (query: string) => void; autoFocus?: boolean; expandable?: boolean }
export interface StackProps extends ComponentProps<'div'> { direction?: 'horizontal' | 'vertical'; gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'; justify?: 'start' | 'center' | 'end' | 'between' | 'around'; wrap?: boolean; as?: keyof import('react').JSX.IntrinsicElements }
