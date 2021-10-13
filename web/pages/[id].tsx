import Room from 'components/Game';

export default ({ id }: { id?: string }) => {
  return <>{id && <Room id={id} />}</>;
};
