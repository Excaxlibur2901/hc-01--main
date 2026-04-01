import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TOKEN_PREFIX } from './constants';

dayjs.extend(relativeTime);

export const formatToken = (num) => `${TOKEN_PREFIX}${num.toString().padStart(3, '0')}`;

export const formatTime = (date) => dayjs(date).format('HH:mm');

export const formatDate = (date) => dayjs(date).format('MMM DD, YYYY');

export const formatRelative = (date) => dayjs(date).fromNow();

export const formatDuration = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export const printReceipt = (token) => {
  // Simple receipt print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head><title>Token Receipt</title>
        <style>body{font-family:Arial; max-width:400px; margin:40px; padding:20px; border:1px solid #ccc;}
        .token{font-size:48px; font-weight:bold; text-align:center; color:#0ea5e9;} .priority{padding:4px 12px; border-radius:20px; font-weight:bold;}
        </style>
      </head>
      <body>
        <h2>🏥 Hospital OPD Token</h2>
        <div class="token">${formatToken(token.tokenNumber)}</div>
        <p><strong>Patient:</strong> ${token.patientName}</p>
        <p><strong>Priority:</strong> <span class="priority ${token.priority}">${token.priority.toUpperCase()}</span></p>
        <p><strong>Time:</strong> ${formatTime(token.createdAt)}</p>
        <p>Please wait for your token to be called. Estimated wait: ~${token.estimatedWaitTime ?? '--'} min</p>
        <hr>
        <small>Thank you for choosing our hospital.</small>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
