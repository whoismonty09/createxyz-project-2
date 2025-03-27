"use client";
import React from "react";

function MainComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState("");

  const categories = {
    text: { name: "Text Generation", color: "bg-[#4A90E2]" },
    image: { name: "Image Generation", color: "bg-[#50E3C2]" },
    vision: { name: "Vision", color: "bg-[#F5A623]" },
    language: { name: "Language", color: "bg-[#BD10E0]" },
    search: { name: "Search & Data", color: "bg-[#7ED321]" },
    utility: { name: "Utility", color: "bg-[#9013FE]" },
  };

  const models = [
    {
      id: "chatgpt",
      name: "ChatGPT",
      category: "text",
      description: "Advanced language model for text generation",
      endpoint: "/integrations/chat-gpt/conversationgpt4",
    },
    {
      id: "gemini",
      name: "Google Gemini 1.5",
      category: "text",
      description: "Advanced text and code generation model",
      endpoint: "/integrations/google-gemini-1-5/",
    },
    {
      id: "claude",
      name: "Claude Sonnet 3.5",
      category: "text",
      description: "Sophisticated text analysis model",
      endpoint: "/integrations/anthropic-claude-sonnet-3-5/",
    },
    {
      id: "dalle",
      name: "DALL·E 3",
      category: "image",
      description: "Realistic image generation",
      endpoint: "/integrations/dall-e-3/",
    },
    {
      id: "stable",
      name: "Stable Diffusion V3",
      category: "image",
      description: "Artistic image generation",
      endpoint: "/integrations/stable-diffusion-v-3/",
    },
    {
      id: "vision",
      name: "GPT Vision",
      category: "vision",
      description: "Image analysis and interpretation",
      endpoint: "/integrations/gpt-vision/",
    },
    {
      id: "translate",
      name: "Google Translate",
      category: "language",
      description: "Language translation service",
      endpoint: "/integrations/google-translate/language/translate/v2",
    },
    {
      id: "search",
      name: "Google Search",
      category: "search",
      description: "Web search capabilities",
      endpoint: "/integrations/google-search/search",
    },
    {
      id: "imagesearch",
      name: "Image Search",
      category: "search",
      description: "Image search service",
      endpoint: "/integrations/image-search/imagesearch",
    },
    {
      id: "places",
      name: "Place Autocomplete",
      category: "search",
      description: "Location data and suggestions",
      endpoint: "/integrations/google-place-autocomplete/autocomplete/json",
    },
    {
      id: "business",
      name: "Business Data",
      category: "search",
      description: "Local business information",
      endpoint: "/integrations/local-business-data/search",
    },
    {
      id: "products",
      name: "Product Search",
      category: "search",
      description: "Product information and search",
      endpoint: "/integrations/product-search/search",
    },
    {
      id: "scraping",
      name: "Web Scraping",
      category: "search",
      description: "Web data extraction",
      endpoint: "/integrations/web-scraping/post",
    },
    {
      id: "weather",
      name: "Weather",
      category: "utility",
      description: "Weather information by city",
      endpoint: "/integrations/weather-by-city/weather/",
    },
    {
      id: "qr",
      name: "QR Code",
      category: "utility",
      description: "QR code generation",
      endpoint: "/integrations/qr-code/generatebasicbase64",
    },
  ];

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setPrompt("");
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedModel || !prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let response;

      switch (selectedModel.category) {
        case "image":
          response = await fetch(
            `${selectedModel.endpoint}?prompt=${encodeURIComponent(prompt)}`
          );
          break;

        case "vision":
          response = await fetch(selectedModel.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: "What do you see in this image?" },
                    { type: "image_url", image_url: { url: prompt } },
                  ],
                },
              ],
            }),
          });
          break;

        case "language":
          response = await fetch(selectedModel.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              q: prompt,
              target: "es",
            }),
          });
          break;

        case "search":
          response = await fetch(
            `${selectedModel.endpoint}?q=${encodeURIComponent(prompt)}`
          );
          break;

        case "utility":
          if (selectedModel.id === "weather") {
            response = await fetch(
              `${selectedModel.endpoint}${encodeURIComponent(prompt)}`
            );
          } else if (selectedModel.id === "qr") {
            response = await fetch(
              `${selectedModel.endpoint}?data=${encodeURIComponent(prompt)}`
            );
          }
          break;

        default:
          response = await fetch(selectedModel.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: prompt }],
            }),
          });
      }

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    switch (selectedModel.category) {
      case "text":
        return (
          <div className="mt-6 p-6 bg-[#333333] rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Response</h3>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    result.choices[0].message.content
                  )
                }
                className="px-3 py-1 bg-[#444444] rounded hover:bg-[#555555] transition-colors"
              >
                <i className="fas fa-copy mr-2"></i>Copy
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              {result.choices[0].message.content}
            </div>
          </div>
        );

      case "image":
        return (
          <div className="mt-6 p-6 bg-[#333333] rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generated Image</h3>
              <a
                href={result.data[0]}
                download
                className="px-3 py-1 bg-[#444444] rounded hover:bg-[#555555] transition-colors"
              >
                <i className="fas fa-download mr-2"></i>Download
              </a>
            </div>
            <div className="relative aspect-square w-full max-w-2xl mx-auto">
              <img
                src={result.data[0]}
                alt="AI Generated"
                className="rounded-lg object-contain w-full h-full"
              />
            </div>
          </div>
        );

      case "vision":
        return (
          <div className="mt-6 p-6 bg-[#333333] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Uploaded Image</h3>
                <img
                  src={result.image}
                  alt="Analyzed"
                  className="rounded-lg w-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Analysis</h3>
                <div className="prose prose-invert">
                  {result.choices[0].message.content}
                </div>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="mt-6 p-6 bg-[#333333] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Original Text</h3>
                <div className="p-4 bg-[#444444] rounded-lg">{prompt}</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Translation</h3>
                <div className="p-4 bg-[#444444] rounded-lg">
                  {result.data.translations[0].translatedText}
                </div>
              </div>
            </div>
          </div>
        );

      case "search":
        return (
          <div className="mt-6 space-y-4">
            {result.items?.map((item, index) => (
              <div key={index} className="p-4 bg-[#333333] rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                <p className="text-gray-400 text-sm">{item.displayLink}</p>
                <p className="mt-2">{item.snippet}</p>
              </div>
            ))}
          </div>
        );

      case "utility":
        if (selectedModel.id === "weather") {
          const weather = result.current;
          return (
            <div className="mt-6 p-6 bg-[#333333] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {result.location.name}
                  </h3>
                  <p className="text-gray-400">{result.location.region}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl">{weather.temp_c}°C</p>
                  <p className="text-gray-400">{weather.condition.text}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 bg-[#444444] rounded-lg">
                  <p className="text-gray-400">Humidity</p>
                  <p className="text-xl">{weather.humidity}%</p>
                </div>
                <div className="p-3 bg-[#444444] rounded-lg">
                  <p className="text-gray-400">Wind</p>
                  <p className="text-xl">{weather.wind_kph} km/h</p>
                </div>
                <div className="p-3 bg-[#444444] rounded-lg">
                  <p className="text-gray-400">Feels Like</p>
                  <p className="text-xl">{weather.feelslike_c}°C</p>
                </div>
                <div className="p-3 bg-[#444444] rounded-lg">
                  <p className="text-gray-400">Pressure</p>
                  <p className="text-xl">{weather.pressure_mb} mb</p>
                </div>
              </div>
            </div>
          );
        } else if (selectedModel.id === "qr") {
          return (
            <div className="mt-6 p-6 bg-[#333333] rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated QR Code</h3>
                <a
                  href={result}
                  download="qr-code.png"
                  className="px-3 py-1 bg-[#444444] rounded hover:bg-[#555555] transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>Download
                </a>
              </div>
              <div className="flex justify-center">
                <img src={result} alt="QR Code" className="max-w-xs" />
              </div>
              <p className="mt-4 text-center text-gray-400">
                Encoded data: {prompt}
              </p>
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="mt-6 p-4 bg-[#333333] rounded-lg">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-inter">
            AI Model Hub
          </h1>
          <p className="text-xl text-gray-400">Search and Use AI Models</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AI models..."
            className="flex-1 p-4 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-700 
                     transition-all duration-300 focus:outline-none focus:border-gray-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-4 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 
                     transition-all duration-300 focus:outline-none focus:border-gray-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => handleModelSelect(model)}
              className={`p-6 rounded-lg bg-[#2a2a2a] cursor-pointer transform transition-all duration-300 
                        hover:scale-[1.02] hover:shadow-xl ${
                          selectedModel?.id === model.id
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
            >
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
                  categories[model.category].color
                }`}
              >
                {categories[model.category].name}
              </div>
              <h3 className="text-xl font-semibold mb-2">{model.name}</h3>
              <p className="text-gray-400 mb-4">{model.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">Available</span>
                <button className="px-4 py-2 bg-[#333333] rounded-lg hover:bg-[#444444] transition-colors duration-300">
                  Try Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedModel && (
          <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Try {selectedModel.name}
            </h2>
            {selectedModel.category === "vision" ? (
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPrompt(reader.result);
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 bg-[#333333] rounded-lg text-white"
                />
              </div>
            ) : (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-full h-32 p-4 mb-4 rounded-lg bg-[#333333] text-white placeholder-gray-400 border border-gray-700 
                         transition-all duration-300 focus:outline-none focus:border-gray-500"
              />
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 px-6 bg-blue-600 rounded-lg font-semibold
                       transition-all duration-300 hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>Processing...
                </span>
              ) : (
                "Submit"
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 text-red-400 rounded-lg">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {renderResult()}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;