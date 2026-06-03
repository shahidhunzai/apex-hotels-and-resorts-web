
import React from 'react';
import Offers from '../../components/Offers/Offers';
import FastCheckin from '../../components/FastCheckin/FastCheckin';
import ContactUs from '../../components/ContactUs/ContactUs';

const sampleUpcoming = [];

const samplePast = [];

const About = () => {
	return (
		<main className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-[calc(100vh-200px)] pb-16">
			<header className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16 mb-10 overflow-hidden shadow-lg">
				<div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
				<div className="relative max-w-6xl mx-auto px-4 z-10">
					<h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg flex items-center gap-3">
						<span role="img" aria-label="celebration">🎉</span> Roomy Events
					</h1>
					<p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl drop-shadow">Connecting guests and hosts across Pakistan with memorable experiences.</p>
				</div>
				<div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/80 to-transparent"></div>
			</header>

						<nav className="max-w-6xl mx-auto px-4 py-6">
							<ul className="flex flex-wrap gap-4 text-sm justify-center">
								<li>
									<a href="#events-overview" className="px-4 py-2 rounded-full bg-white/80 text-indigo-700 font-semibold shadow hover:bg-indigo-100 transition">Events Overview</a>
								</li>
								<li>
									<a href="#upcoming-events" className="px-4 py-2 rounded-full bg-white/80 text-purple-700 font-semibold shadow hover:bg-purple-100 transition">Upcoming</a>
								</li>
								<li>
									<a href="#past-events" className="px-4 py-2 rounded-full bg-white/80 text-pink-700 font-semibold shadow hover:bg-pink-100 transition">Past</a>
								</li>
								<li>
									<a href="#events-faq" className="px-4 py-2 rounded-full bg-white/80 text-blue-700 font-semibold shadow hover:bg-blue-100 transition">FAQ</a>
								</li>
							</ul>
						</nav>

						<section id="events-overview" className="max-w-6xl mx-auto px-4 py-10">
							<h2 className="text-3xl font-bold text-center text-indigo-700 mb-4 flex items-center justify-center gap-2">
								<span role="img" aria-label="calendar">📅</span> Events
							</h2>
							<div className="mx-auto border-t-4 border-indigo-200 w-24 mb-6"></div>
							<p className="mt-3 text-gray-700 max-w-2xl mx-auto text-center text-lg">We run community meetups, host workshops, and participate in local initiatives — all aimed at improving the travel and hosting experience.</p>
						</section>

						{/* Home page featured components reused here */}
						<section className="my-12">
							<Offers />
						</section>
						<section className="my-12">
							<FastCheckin />
						</section>
						<section className="my-12">
							<ContactUs />
						</section>

						{sampleUpcoming.length > 0 && (
						<section id="upcoming-events" className="max-w-6xl mx-auto px-4 py-8">
							<h3 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
								<span role="img" aria-label="megaphone">📣</span> Upcoming Events
							</h3>
							<div className="mx-auto border-t-4 border-purple-200 w-20 mb-6"></div>
							<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
								{sampleUpcoming.map((ev) => (
									<article key={ev.id} className="relative border-2 border-purple-200 rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition group overflow-hidden">
										<div className="absolute -top-4 -right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg group-hover:scale-110 transition">NEW</div>
										<h4 className="text-xl font-bold flex items-center gap-2 text-purple-700">
											<span role="img" aria-label="event">🎈</span> {ev.title}
										</h4>
										<p className="text-sm text-gray-500 mt-1">{new Date(ev.date).toLocaleDateString()}</p>
										<p className="mt-2 text-gray-700">{ev.description}</p>
										<p className="mt-3 text-sm text-gray-600">Location: <span className="font-semibold">{ev.location}</span></p>
										<div className="mt-4">
											<a className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition" href="#">Register</a>
										</div>
									</article>
								))}
							</div>
						</section>
						)}

						{samplePast.length > 0 && (
						<section id="past-events" className="max-w-6xl mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50 rounded-xl shadow-inner">
							<h3 className="text-2xl font-bold text-pink-700 mb-4 flex items-center gap-2">
								<span role="img" aria-label="sparkles">✨</span> Past Events
							</h3>
							<div className="mx-auto border-t-4 border-pink-200 w-20 mb-6"></div>
							<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
								{samplePast.map((item) => (
									<figure key={item.id} className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group">
										<img alt={item.title} src={item.image} className="w-full h-44 object-cover group-hover:scale-105 transition" />
										<figcaption className="p-4 flex flex-col gap-1">
											<div className="flex items-center gap-2 font-semibold text-pink-700">
												<span role="img" aria-label="medal">🏅</span> {item.title}
											</div>
											<div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
										</figcaption>
									</figure>
								))}
							</div>
						</section>
						)}

						<section id="events-faq" className="max-w-6xl mx-auto px-4 py-10">
							<h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
								<span role="img" aria-label="question">❓</span> Events FAQ
							</h3>
							<div className="mx-auto border-t-4 border-blue-200 w-20 mb-6"></div>
							<dl className="mt-4 space-y-6 bg-white rounded-xl shadow p-6">
								<div>
									<dt className="font-semibold text-blue-700 flex items-center gap-2"><span role="img" aria-label="register">📝</span> How do I register?</dt>
									<dd className="text-gray-700 ml-6 mt-1">Click the Register button on the event card or follow the link in the event details.</dd>
								</div>
								<div>
									<dt className="font-semibold text-blue-700 flex items-center gap-2"><span role="img" aria-label="free">💸</span> Are the events free?</dt>
									<dd className="text-gray-700 ml-6 mt-1">Most community events are free; some workshops may have a fee. Details are listed per event.</dd>
								</div>
							</dl>
						</section>
		</main>
	);
};

export default About;
