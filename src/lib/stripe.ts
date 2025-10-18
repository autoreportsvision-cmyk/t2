
import Stripe from 'stripe';

// A chave da API do Stripe é lida diretamente da variável de ambiente.
// É crucial que a variável STRIPE_API_KEY esteja configurada como um "secret" no backend do Firebase App Hosting.
// A verificação de existência foi removida daqui para não quebrar o processo de 'build',
// pois a variável só é necessária em tempo de execução.
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});
