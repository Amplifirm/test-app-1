// Minimal react-native mock for node-environment jest runs.
export const Platform = {
  OS: 'ios',
  select: <T,>(spec: { ios?: T; android?: T; default?: T }): T | undefined =>
    spec.ios ?? spec.default,
  Version: 0,
};
