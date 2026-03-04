import './TokenGuard.scss';

const TokenGuard = () => (
  <div className="token-guard">
    <div className="token-guard__card">
      <div className="token-guard__monogram" aria-hidden="true">S &amp; A</div>
      <h1 className="token-guard__title">Acceso no autorizado</h1>
      <p className="token-guard__text">
        Este editor es exclusivo para clientes. Si compraste el template y no tienes tu enlace de acceso, contáctanos.
      </p>
    </div>
  </div>
);

export default TokenGuard;
