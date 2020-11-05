cmake_minimum_required(VERSION 3.16)
project(api_quickstart)

set(CMAKE_CXX_STANDARD 17)

add_executable(api_quickstart main.cpp)

find_package(Boost 1.71 REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)

target_link_libraries(${PROJECT_NAME}
        PRIVATE curl
        PRIVATE OpenSSL::SSL
        )
