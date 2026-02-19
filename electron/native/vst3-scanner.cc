/**
 * VST3 Plugin Scanner — discovers VST3 plugins from standard paths.
 *
 * Full implementation requires Steinberg VST3 SDK for reading plugin metadata.
 * This stub scans filesystem for .vst3 bundles.
 */

#ifdef HAS_VST3_SDK

#include "vst3-scanner.h"
#include <filesystem>
#include <algorithm>

namespace fs = std::filesystem;

std::vector<PluginInfo> VST3Scanner::scan(const std::vector<std::string>& searchPaths) {
    std::vector<PluginInfo> plugins;

    for (const auto& searchPath : searchPaths) {
        if (!fs::exists(searchPath)) continue;

        try {
            for (const auto& entry : fs::recursive_directory_iterator(searchPath)) {
                if (entry.path().extension() == ".vst3") {
                    PluginInfo info;
                    info.path = entry.path().string();
                    info.name = entry.path().stem().string();
                    info.vendor = "Unknown";
                    info.uid = entry.path().string();

                    // TODO: Use VST3 SDK to read actual plugin metadata
                    // - IPluginFactory to enumerate classes
                    // - Distinguish instruments from effects
                    info.isInstrument = false;
                    info.isEffect = true;

                    plugins.push_back(info);
                }
            }
        } catch (const fs::filesystem_error&) {
            // Skip directories we can't access
            continue;
        }
    }

    return plugins;
}

#endif // HAS_VST3_SDK
