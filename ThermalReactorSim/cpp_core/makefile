CXX = g++
CXXFLAGS = -O3 -std=c++17 -fPIC -Iinclude
LDFLAGS = -shared
TARGET = libthermal_reactor.so
SRC = src/thermal_reactor_model.cpp

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $(SRC) -o $(TARGET) $(LDFLAGS)

clean:
	rm -f $(TARGET) *.o src/*.o
