import Image from "next/image";

type Props = {
  className?: string;
};

export function MindBloomLogo({ className }: Props) {
  return (
    <Image
      src="/mindbloom-logo.png"
      alt="MindBloom Logo"
      width={40}
      height={40}
      className={className}
      priority
    />
  );
}
