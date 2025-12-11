import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Contact } from '../../types';

interface ContactsWidgetProps {
  contacts: Contact[];
  overdueContacts: (Contact & { isOverdue: boolean; daysOverdue: number; nextContactDate: number })[];
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onUpdateContact: (id: string, updates: Partial<Contact>) => void;
  onDeleteContact: (id: string) => void;
  itemId: string;
  isDark: boolean;
}

const ContactsWidget: React.FC<ContactsWidgetProps> = ({
  contacts,
  overdueContacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAllContacts, setShowAllContacts] = useState(false);

  const [newContact, setNewContact] = useState({
    name: '',
    frequency: '',
    birthday: '',
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const cardBg = isDark ? 'bg-slate-700/30' : 'bg-gray-50';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  // Calculate upcoming birthdays (next 30 days)
  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return contacts
      .filter(c => c.birthday)
      .map(contact => {
        const bday = new Date(contact.birthday!);
        // Set to current year
        let nextBirthday = new Date(currentYear, bday.getMonth(), bday.getDate());
        // If already passed this year, use next year
        if (nextBirthday < now) {
          nextBirthday = new Date(currentYear + 1, bday.getMonth(), bday.getDate());
        }
        const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const age = nextBirthday.getFullYear() - bday.getFullYear();
        return { ...contact, nextBirthday, daysUntil, age };
      })
      .filter(c => c.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contacts]);

  const formatDays = (days: number) => {
    return days === 0 ? "Aujourd'hui" : `${days} jours`;
  };

  const formatBirthday = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleAdd = () => {
    onAddContact({
      itemId,
      name: newContact.name,
      contactFrequencyDays: newContact.frequency ? parseInt(newContact.frequency) : undefined,
      birthday: newContact.birthday ? new Date(newContact.birthday).getTime() : undefined,
      lastContactDate: Date.now(),
    });
    setNewContact({ name: '', frequency: '', birthday: '' });
    setShowAddForm(false);
  };

  const handlePing = (contact: Contact) => {
    onUpdateContact(contact.id, { lastContactDate: Date.now() });
  };


  return (
    <div className={`rounded-2xl border overflow-hidden ${bgClass} ${borderClass}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Icons.Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Proches à contacter</p>
            <p className={`text-xs ${textSecondary}`}>
              {overdueContacts.length > 0
                ? `${overdueContacts.length} personne${overdueContacts.length > 1 ? 's' : ''} en attente`
                : 'Tout le monde est à jour 👍'}
            </p>
          </div>
        </div>
        <Icons.ChevronDown
          size={16}
          className={`transition-transform ${textSecondary} ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>

          {/* Upcoming Birthdays */}
          {upcomingBirthdays.length > 0 && (
            <div className="p-4 space-y-2">
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} flex items-center gap-2`}>
                <Icons.Gift size={12} className="text-pink-400" />
                Anniversaires à venir
              </h4>
              {upcomingBirthdays.slice(0, 3).map(contact => (
                <div key={contact.id} className={`p-2 rounded-lg ${isDark ? 'bg-pink-500/10' : 'bg-pink-50'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${textPrimary}`}>{contact.name}</p>
                      <p className="text-[10px] text-pink-400">{formatBirthday(contact.nextBirthday)} • {contact.age} ans</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    contact.daysUntil <= 3 
                      ? 'bg-pink-500 text-white animate-pulse' 
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {contact.daysUntil === 0 ? "Aujourd'hui 🎂" : `J-${contact.daysUntil}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Overdue Contacts */}
          {overdueContacts.length > 0 && (
            <div className="p-4 space-y-3">
              {overdueContacts.map(contact => (
                <div key={contact.id} className={`p-3 rounded-xl border border-l-4 border-l-orange-400 ${cardBg} border-slate-700/50`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-semibold ${textPrimary}`}>{contact.name}</h4>
                      <p className="text-xs text-orange-400 font-medium">
                        Vu il y a {formatDays(contact.daysOverdue + (contact.contactFrequencyDays || 0))}
                        {/* Approx calculation visually */}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePing(contact)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${isDark ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                        }`}
                    >
                      <Icons.MessageCircle size={14} />
                      J'ai pris des nouvelles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Contacts Toggle */}
          <div className="px-4 pb-2">
            <button
              onClick={() => setShowAllContacts(!showAllContacts)}
              className={`w-full py-2 text-xs font-medium flex items-center justify-center gap-1 ${textSecondary}`}
            >
              Voir tous les contacts ({contacts.length})
              <Icons.ChevronDown size={12} className={showAllContacts ? 'rotate-180' : ''} />
            </button>
          </div>

          {showAllContacts && (
            <div className="px-4 pb-4 space-y-2">
              {contacts.map(contact => (
                <div key={contact.id} className={`flex items-center justify-between p-2 rounded-lg ${cardBg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-gray-200 text-gray-700'
                      }`}>
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${textPrimary}`}>{contact.name}</p>
                      <p className={`text-[10px] ${textSecondary}`}>
                        Fréquence: {contact.contactFrequencyDays ? `${contact.contactFrequencyDays}j` : 'Aucune'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400"
                    >
                      <Icons.Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'} pt-3 space-y-3`}>
              <div>
                <label className={`text-[10px] ${textSecondary}`}>Nom</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  placeholder="Maman"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Fréquence (jours)</label>
                  <input
                    type="number"
                    value={newContact.frequency}
                    onChange={e => setNewContact(prev => ({ ...prev, frequency: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                    placeholder="7"
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Anniversaire</label>
                  <input
                    type="date"
                    value={newContact.birthday}
                    onChange={e => setNewContact(prev => ({ ...prev, birthday: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newContact.name}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-indigo-500 text-white"
                >
                  Ajouter
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Icons.Plus size={14} />
                Ajouter un contact
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsWidget;
