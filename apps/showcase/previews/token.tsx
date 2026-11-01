import { TokenIcon, TokenBadge, type TokenIconSize } from "../../../packages/highway-react/src/components/ui/token-icon";
import { useExampleState } from "./example-state";
export function TokenIconPreview() {
  const [network] = useExampleState("network", "solana");
  const networkLabel = network === "fallback-no-icon" ? "Unknown network" : network === "ethereum-evm" ? "Ethereum" : network.charAt(0).toUpperCase() + network.slice(1);
  const [size] = useExampleState<TokenIconSize>("size", "large");
  const [state] = useExampleState("tokenState", "default");
  return <div className="library-preview-row"><TokenIcon size={size} token={{ symbol: "SOL", name: "Solana", imageUrl: state === "fallback" ? undefined : state === "broken" ? "/token-art/missing.svg" : "/token-art/solana.svg" }} network={state === "no-badge" ? undefined : { label: networkLabel, imageUrl: `/network-art/${network}.svg` }} /></div>;
}
export function TokenBadgePreview() {
  const [network] = useExampleState("network", "solana");
  const networkLabel = network === "fallback-no-icon" ? "Unknown network" : network === "ethereum-evm" ? "Ethereum" : network.charAt(0).toUpperCase() + network.slice(1);
  const [size] = useExampleState<TokenIconSize>("size", "large");
  return <div className="library-preview-row"><TokenBadge size={size} label={networkLabel} imageUrl={`/network-art/${network}.svg`} /></div>;
}
