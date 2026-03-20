CXX = g++
CXXFLAGS = -O3 -std=c++17 -fPIC -Iinclude
LDFLAGS = -shared
TARGET = libfusion_plasma.so
SRC = src/fusion_plasma_model.cpp

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $(SRC) -o $(TARGET) $(LDFLAGS)

clean:
	rm -f $(TARGET) *.o src/*.o
