import { Badge, BadgeProps } from 'react-bootstrap'

interface ProperBadgeProps extends BadgeProps {
  children: React.ReactNode;
  capitalize?: boolean;
}

type ProperBadgeComponent = (props: ProperBadgeProps) => React.ReactNode

const ProperBadge: ProperBadgeComponent = ({ children, capitalize = true, ...props }) => {
  return (
    <Badge pill={props.pill ?? true} bg={props.bg} style={{ color: 'white' }} {...props}>
      {capitalize && typeof children === 'string' ? children.charAt(0).toUpperCase() + children.slice(1) : children}
    </Badge>
  )
}

export default ProperBadge

