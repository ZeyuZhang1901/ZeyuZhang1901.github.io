# Override jekyll-cache-bust: it hashes assets/_sass, but this theme keeps
# stylesheets in _sass/. An empty digest made main.css?v= always the same
# (d41d8cd9…), so browsers kept stale CSS after About/layout updates.
module Jekyll
  module CacheBust
    def bust_css_cache(file_name)
      CacheDigester.new(file_name: file_name, directory: '_sass').digest!
    end
  end
end
