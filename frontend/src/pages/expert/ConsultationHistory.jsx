import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FaHistory, FaStar } from 'react-icons/fa';
import { format } from 'date-fns';

export default function ConsultationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/appointments?status=completed');
        setHistory(data.appointments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <h1 className="page-title mb-6 flex items-center gap-2"><FaHistory /> Consultation History</h1>

      {history.length === 0 ? (
        <div className="empty-state">
          <FaHistory className="empty-icon" />
          <h3>No past consultations</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map(apt => (
            <div key={apt._id} className="card">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <img src={apt.farmer?.profileImage || 'https://via.placeholder.com/50'} alt="" className="avatar" />
                  <div>
                    <h3 className="font-bold text-lg">{apt.farmer?.name}</h3>
                    <p className="text-sm text-text-secondary">{apt.topic}</p>
                    <p className="text-xs text-text-muted mt-1">{format(new Date(apt.date), 'MMMM dd, yyyy')} • {apt.timeSlot}</p>
                  </div>
                </div>
                
                <div className="md:text-right bg-bg-elevated p-3 rounded border border-border md:w-64">
                  <p className="text-xs text-text-muted uppercase mb-1">Session Feedback</p>
                  {apt.rating ? (
                    <>
                      <div className="flex items-center md:justify-end gap-1 text-gold mb-1">
                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < apt.rating ? '' : 'empty'} />)}
                      </div>
                      <p className="text-sm italic text-text-secondary">"{apt.feedback}"</p>
                    </>
                  ) : (
                    <p className="text-sm italic text-text-muted">Pending review from farmer.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
