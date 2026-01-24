import Image from "next/image";

type Props = {
  className?: string;
};

export function MindBloomLogo({ className }: Props) {
  return (
    <Image
      src="/mindbloom-logo.png"
      alt="MindBloom Logo"
      width={56}
      height={56}
      priority
      className={`object-contain ${className ?? ""}`}
    />
  );
}
