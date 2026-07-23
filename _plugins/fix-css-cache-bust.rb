# Override jekyll-cache-bust: upstream hashes assets/_sass, but this theme
# keeps stylesheets in _sass/. An empty digest made main.css?v= always
# d41d8cd9…, so browsers kept stale CSS after layout updates.
require "digest/md5"

module Jekyll
  module CacheBust
    def bust_css_cache(file_name)
      files = Dir[File.join("_sass", "**", "*")].reject { |f| File.directory?(f) }
      digest = Digest::MD5.hexdigest(files.map { |f| File.read(f) }.join)
      "#{file_name}?v=#{digest}"
    end
  end
end

# Re-register so this definition wins over the gem's.
Liquid::Template.register_filter(Jekyll::CacheBust)
