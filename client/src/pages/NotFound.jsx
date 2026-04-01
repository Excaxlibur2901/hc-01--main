import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
      <Card elevated className="max-w-md w-full text-center py-16">
        <div className="w-24 h-24 mx-auto mb-8 bg-slate-100 rounded-3xl flex items-center justify-center">
          <span className="text-4xl">❓</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">Page Not Found</h1>
        <p className="text-slate-600 mb-8 text-lg">The panel you're looking for doesn't exist.</p>
        <Link to="/">
          <Button size="xl" className="w-full">
            ← Back to Home
          </Button>
        </Link>
        <p className="text-sm text-slate-500 mt-6">Valid paths: /reception /doctor /display /home</p>
      </Card>
    </div>
  );
}

