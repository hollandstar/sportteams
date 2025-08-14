import React from 'react'

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 bg-green-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-green-800 bg-opacity-80"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Star Rating */}
        <div className="flex justify-center mb-6">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-6 h-6 text-yellow-400 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Testimonial Quote */}
        <blockquote className="text-xl sm:text-2xl text-white font-medium mb-6 leading-relaxed">
          "We gebruiken het nu een seizoen en zien een groot verschil in betrokkenheid en prestatie. 
          Spelers voelen zich meer eigenaar van hun ontwikkeling."
        </blockquote>

        {/* Author */}
        <div className="text-gray-200">
          <cite className="not-italic font-medium">– Anne, Hoofdtrainer JO16 Veldhockey</cite>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection