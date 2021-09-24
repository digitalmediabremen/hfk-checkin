
const ifElse = <PropsA extends object, PropsB extends object>(
    condition: () => boolean,
    ComponentA: React.ComponentType<PropsA>,
    ComponentB: React.ComponentType<PropsB>,
): React.FC<PropsA | PropsB> => (props) => {
    if (condition()) return <ComponentA {...(props as PropsA)} />;
    return <ComponentB {...(props as PropsB)} />;
};



export default ifElse;
