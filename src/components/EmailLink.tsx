interface EmailLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
}

export default function EmailLink({ className, children, ...props }: EmailLinkProps) {
  return (
    <a
      href="mailto:info@opendesk-edu.org"
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}
