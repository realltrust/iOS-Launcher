import { Link } from 'react-router-dom';
import { CURRICULUM } from '../data/curriculum';

export default function Lessons() {
  const levels = ['beginner', 'intermediate', 'advanced'] as const;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Typing Lessons</h1>
      {levels.map((lvl) => (
        <section key={lvl}>
          <h2 className="text-lg font-semibold capitalize text-slate-800 dark:text-slate-100 mb-3">{lvl}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CURRICULUM.filter((l) => l.level === lvl).map((l) => (
              <Link key={l.id} to={`/lessons/${l.id}`}
                className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow hover:shadow-md transition">
                <div className="font-semibold text-slate-900 dark:text-white">{l.title}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{l.description}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
